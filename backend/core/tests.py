import time
from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from core.events import EventBus
from core.middleware import SecuritySanitizationMiddleware

class EventBusTests(TestCase):
    def setUp(self):
        self.bus = EventBus()

    def test_publish_and_subscribe(self):
        """Test that subscriber receives published events via FIFO queue"""
        q = self.bus.subscribe()
        self.bus.publish('test.event', {'message': 'Hello EventBus'})

        event = q.get(timeout=2)
        self.assertEqual(event['type'], 'test.event')
        self.assertEqual(event['data']['message'], 'Hello EventBus')
        self.assertTrue('id' in event)
        self.assertTrue('timestamp' in event)

        self.bus.unsubscribe(q)

    def test_historical_ring_buffer(self):
        """Test delta synchronization retrieves events since timestamp"""
        t0 = time.time()
        time.sleep(0.01)
        self.bus.publish('event.1', {'num': 1})
        self.bus.publish('event.2', {'num': 2})

        recent = self.bus.get_events_since(t0)
        self.assertGreaterEqual(len(recent), 2)
        types = [e['type'] for e in recent]
        self.assertIn('event.1', types)
        self.assertIn('event.2', types)


class SecurityMiddlewareTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = SecuritySanitizationMiddleware(lambda r: HttpResponse("OK"))

    def test_xss_query_param_blocked(self):
        """Malicious XSS script in query params is blocked with 400"""
        req = self.factory.get('/api/conversations/?query=<script>alert(1)</script>')
        resp = self.middleware(req)
        self.assertEqual(resp.status_code, 400)

    def test_path_traversal_blocked(self):
        """Path traversal patterns are blocked with 400"""
        req = self.factory.get('/api/conversations/../../etc/passwd')
        resp = self.middleware(req)
        self.assertEqual(resp.status_code, 400)

    def test_security_headers_injected(self):
        """Standard HTTP responses receive enterprise hardening headers"""
        req = self.factory.get('/api/conversations/')
        resp = self.middleware(req)
        self.assertEqual(resp['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(resp['X-Frame-Options'], 'DENY')
        self.assertEqual(resp['X-XSS-Protection'], '1; mode=block')
        self.assertEqual(resp['Referrer-Policy'], 'strict-origin-when-cross-origin')

