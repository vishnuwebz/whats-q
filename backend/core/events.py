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

class EventBus:
    """
    High-performance, thread-safe in-memory event bus.
    Provides publish-subscribe mechanics for Server-Sent Events (SSE)
    and historical event replay for delta sync endpoints.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._history: List[Dict[str, Any]] = []
        self._subscribers: List[queue.Queue] = []

    def publish(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publishes an event to all active real-time subscribers
        and appends it to the historical ring buffer.
        """
        event = {
            'id': f"evt_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}",
            'type': event_type,
            'data': data,
            'timestamp': time.time(),
        }

        with self._lock:
            # Maintain bounded ring buffer
            self._history.append(event)
            if len(self._history) > MAX_EVENT_HISTORY:
                self._history.pop(0)

            # Broadcast to all active SSE queues
            dead_queues = []
            for q in self._subscribers:
                try:
                    q.put_nowait(event)
                except queue.Full:
                    dead_queues.append(q)

            # Clean up saturated/dead queues
            for dq in dead_queues:
                if dq in self._subscribers:
                    self._subscribers.remove(dq)

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
            return [evt for evt in self._history if evt['timestamp'] > since_timestamp]

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
