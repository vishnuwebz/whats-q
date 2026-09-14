import os
import time
import uuid
import json
import threading
import queue
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Maximum number of past events to retain in ring buffer for delta sync
MAX_EVENT_HISTORY = 1000
REDIS_CHANNEL = 'whatsq_realtime_events'

class EventBus:
    """
    High-performance, thread-safe event bus supporting:
    1. Redis Pub/Sub across multi-worker Gunicorn/ASGI processes.
    2. In-memory fallback for local development or when Redis is offline.
    3. Server-Sent Events (SSE) subscriber dispatch queues.
    4. Historical event ring buffer for delta synchronization.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._history: List[Dict[str, Any]] = []
        self._subscribers: List[queue.Queue] = []
        self._redis_client = None
        self._redis_thread = None
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            host = os.environ.get('REDIS_HOST', '127.0.0.1')
            port = int(os.environ.get('REDIS_PORT', 6379))
            r = redis.Redis(host=host, port=port, db=0, socket_timeout=1, socket_connect_timeout=0.5, decode_responses=True)
            r.ping()
            self._redis_client = r

            # Start background listener thread to receive events published by OTHER workers
            def redis_subscriber_loop():
                try:
                    pubsub = self._redis_client.pubsub()
                    pubsub.subscribe(REDIS_CHANNEL)
                    for raw in pubsub.listen():
                        if raw and raw.get('type') == 'message':
                            try:
                                event = json.loads(raw['data'])
                                self._dispatch_locally(event, from_redis=True)
                            except Exception as parse_err:
                                logger.warning(f"[EventBus] Redis parse error: {parse_err}")
                except Exception as loop_err:
                    logger.warning(f"[EventBus] Redis subscriber stopped: {loop_err}")

            t = threading.Thread(target=redis_subscriber_loop, daemon=True)
            t.start()
            self._redis_thread = t
            logger.info(f"[EventBus] Redis Pub/Sub active on {host}:{port}")
        except Exception as e:
            self._redis_client = None
            logger.info(f"[EventBus] Using in-memory event bus (Redis not active: {e})")

    def _dispatch_locally(self, event: Dict[str, Any], from_redis: bool = False):
        with self._lock:
            # Check if event was already recorded in history
            evt_id = event.get('id')
            if evt_id and not any(h.get('id') == evt_id for h in self._history[-100:]):
                self._history.append(event)
                if len(self._history) > MAX_EVENT_HISTORY:
                    self._history.pop(0)

            # Broadcast to all local SSE subscriber queues
            dead_queues = []
            for q in self._subscribers:
                try:
                    q.put_nowait(event)
                except queue.Full:
                    dead_queues.append(q)

            for dq in dead_queues:
                if dq in self._subscribers:
                    self._subscribers.remove(dq)

    def publish(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publishes an event. If Redis is available, fans out to all Gunicorn workers.
        Also dispatches locally to ensure instant zero-latency delivery.
        """
        event = {
            'id': f"evt_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
            'type': event_type,
            'data': data,
            'timestamp': time.time(),
        }

        # 1. Publish to Redis channel (notifies OTHER worker processes)
        if self._redis_client:
            try:
                self._redis_client.publish(REDIS_CHANNEL, json.dumps(event))
            except Exception as e:
                logger.warning(f"[EventBus] Redis publish error: {e}")

        # 2. Immediate local dispatch for this process
        self._dispatch_locally(event, from_redis=False)

        logger.debug(f"[EventBus] Published event: {event_type} (ID: {event['id']})")
        return event

    def subscribe(self) -> queue.Queue:
        """
        Subscribes a client to the live event stream.
        Returns a thread-safe FIFO Queue.
        """
        q: queue.Queue = queue.Queue(maxsize=200)
        with self._lock:
            self._subscribers.append(q)
        return q

    def unsubscribe(self, q: queue.Queue):
        """
        Removes an active subscriber queue.
        """
        with self._lock:
            if q in self._subscribers:
                self._subscribers.remove(q)

    def get_events_since(self, since_timestamp: float) -> List[Dict[str, Any]]:
        """
        Retrieves all historical events that occurred after since_timestamp.
        Used for delta synchronization when clients reconnect.
        """
        with self._lock:
            return [evt for evt in self._history if evt.get('timestamp', 0) > since_timestamp]

    @property
    def active_subscribers_count(self) -> int:
        with self._lock:
            return len(self._subscribers)

# Global singleton event bus
event_bus = EventBus()

def emit_event(event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Public utility to emit real-time events from any Django model, view, or service.
    """
    return event_bus.publish(event_type, data)
