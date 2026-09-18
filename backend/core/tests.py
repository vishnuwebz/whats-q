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


class WooCommerceIntegrationTests(TestCase):
    def setUp(self):
        from core.models import Integration
        self.integration = Integration.objects.create(
            name='WooCommerce',
            category='E-Commerce',
            config={
                'store_url': 'https://coolfix-store.com',
                'consumer_key': 'ck_testkey123456789',
                'consumer_secret': 'cs_testsecret123456789',
                'webhook_secret': 'wc_secret_hash_2026',
            }
        )

    def test_woocommerce_test_connection_success(self):
        """Valid store URL, ck_, and cs_ keys succeed in connection handshake"""
        from rest_framework.test import APIClient
        client = APIClient()
        resp = client.post(f'/api/core/integrations/{self.integration.id}/test-connection/', {
            'config': {
                'store_url': 'https://coolfix-store.com',
                'consumer_key': 'ck_1234567890abcdef',
                'consumer_secret': 'cs_1234567890abcdef',
            }
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertIn('authenticated successfully', resp.data['message'])

    def test_woocommerce_test_connection_invalid_keys(self):
        """Invalid consumer key prefix fails with 400"""
        from rest_framework.test import APIClient
        client = APIClient()
        resp = client.post(f'/api/core/integrations/{self.integration.id}/test-connection/', {
            'config': {
                'store_url': 'https://coolfix-store.com',
                'consumer_key': 'invalid_prefix_key',
                'consumer_secret': 'cs_12345',
            }
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])
        self.assertIn('Consumer Key should start with "ck_"', resp.data['message'])

    def test_woocommerce_webhook_order_dispatch(self):
        """Incoming order webhook creates customer, conversation, and confirmation message"""
        import hmac
        import hashlib
        import base64
        import json
        from rest_framework.test import APIClient
        from conversations.models import Conversation, Message

        client = APIClient()
        payload = {
            'id': 9821,
            'status': 'processing',
            'total': '3450.00',
            'currency': 'INR',
            'billing': {
                'first_name': 'Zayan',
                'last_name': 'Malik',
                'phone': '+919846099887',
                'email': 'zayan@coolfix-store.com',
                'address_1': 'Beach Road, Calicut'
            },
            'line_items': [
                {'name': 'Inverter AC Sensor Board', 'quantity': 1, 'price': '3450.00'}
            ]
        }
        body_bytes = json.dumps(payload).encode('utf-8')
        secret = 'wc_secret_hash_2026'
        signature = base64.b64encode(hmac.new(secret.encode('utf-8'), body_bytes, hashlib.sha256).digest()).decode('utf-8')

        resp = client.post(
            '/api/core/integrations/woocommerce/webhook/',
            data=body_bytes,
            content_type='application/json',
            HTTP_X_WC_WEBHOOK_SIGNATURE=signature
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['order_id'], 9821)

        conv = Conversation.objects.filter(phone_number='+919846099887').first()
        self.assertIsNotNone(conv)
        self.assertEqual(conv.contact_name, 'Zayan Malik')
        self.assertEqual(conv.source, 'WooCommerce')

        msg = Message.objects.filter(conversation=conv).first()
        self.assertIsNotNone(msg)
        self.assertIn('Order Confirmed!', msg.text)
        self.assertIn('9821', msg.text)


