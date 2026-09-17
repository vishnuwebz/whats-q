import json
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from conversations.models import Conversation, Message, WhatsAppTemplate, MetaWhatsAppConfig
from conversations.meta_service import MetaWhatsAppService

class MetaWhatsAppWebhookTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.config = MetaWhatsAppConfig.objects.create(
            phone_number_id="100012345678901",
            waba_id="200012345678901",
            access_token="EAAtesttokenforqiyambusinessossuite2026validfortestingpurposes",
            verify_token="test_secret_token_2026",
            app_secret="",
            connection_status="connected",
            auto_reply_enabled=False
        )

    def test_webhook_get_handshake_success(self):
        """Verify Meta Webhook GET verification handshake succeeds with matching token"""
        resp = self.client.get('/api/conversations/webhook/', {
            'hub.mode': 'subscribe',
            'hub.verify_token': 'test_secret_token_2026',
            'hub.challenge': 'CHALLENGE_ACCEPTED_123'
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.content.decode('utf-8'), 'CHALLENGE_ACCEPTED_123')

    def test_webhook_get_handshake_mismatch(self):
        """Verify Meta Webhook GET verification handshake is rejected with wrong token"""
        resp = self.client.get('/api/conversations/webhook/', {
            'hub.mode': 'subscribe',
            'hub.verify_token': 'wrong_token_xyz',
            'hub.challenge': 'FAIL_CHALLENGE'
        })
        self.assertEqual(resp.status_code, 403)

    def test_webhook_post_incoming_text_message(self):
        """Verify incoming customer WhatsApp text message creates conversation and message"""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "200012345678901",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "919876543210", "phone_number_id": "100012345678901"},
                        "contacts": [{"profile": {"name": "Arun Kumar"}, "wa_id": "919847012345"}],
                        "messages": [{
                            "from": "919847012345",
                            "id": "wamid.test_unique_msg_001",
                            "timestamp": "1715500000",
                            "text": {"body": "Hello, I need assistance with AC repair."},
                            "type": "text"
                        }]
                    }
                }]
            }]
        }
        resp = self.client.post('/api/conversations/webhook/', payload, format='json')
        self.assertEqual(resp.status_code, 200)

        # Verify conversation was created
        conv = Conversation.objects.filter(phone_number__contains="9847012345").first()
        self.assertIsNotNone(conv)
        self.assertEqual(conv.contact_name, "Arun Kumar")
        self.assertTrue(conv.is_online)

        # Verify message was stored
        msg = Message.objects.filter(meta_message_id="wamid.test_unique_msg_001").first()
        self.assertIsNotNone(msg)
        self.assertEqual(msg.text, "Hello, I need assistance with AC repair.")
        self.assertEqual(msg.sender, "customer")

    def test_webhook_duplicate_message_deduplication(self):
        """Verify duplicate Meta webhooks with same wamid are ignored (idempotent)"""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "200012345678901",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "919876543210", "phone_number_id": "100012345678901"},
                        "contacts": [{"profile": {"name": "Arun Kumar"}, "wa_id": "919847012345"}],
                        "messages": [{
                            "from": "919847012345",
                            "id": "wamid.test_duplicate_msg_002",
                            "timestamp": "1715500000",
                            "text": {"body": "First delivery"},
                            "type": "text"
                        }]
                    }
                }]
            }]
        }
        # Post first time
        resp1 = self.client.post('/api/conversations/webhook/', payload, format='json')
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(Message.objects.filter(meta_message_id="wamid.test_duplicate_msg_002").count(), 1)

        # Post duplicate
        resp2 = self.client.post('/api/conversations/webhook/', payload, format='json')
        self.assertEqual(resp2.status_code, 200)
        # Message count must remain 1
        self.assertEqual(Message.objects.filter(meta_message_id="wamid.test_duplicate_msg_002").count(), 1)

    def test_webhook_stop_keyword_suppression(self):
        """Verify STOP keyword triggers automatic WhatsApp opt-out suppression"""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "200012345678901",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "919876543210", "phone_number_id": "100012345678901"},
                        "contacts": [{"profile": {"name": "Unsubscribing Customer"}, "wa_id": "919847099999"}],
                        "messages": [{
                            "from": "919847099999",
                            "id": "wamid.test_stop_msg_003",
                            "timestamp": "1715500000",
                            "text": {"body": "STOP"},
                            "type": "text"
                        }]
                    }
                }]
            }]
        }
        resp = self.client.post('/api/conversations/webhook/', payload, format='json')
        self.assertEqual(resp.status_code, 200)

        conv = Conversation.objects.filter(phone_number__contains="9847099999").first()
        self.assertIsNotNone(conv)
        self.assertTrue(conv.is_opted_out)
        self.assertIn("STOP", conv.suppression_reason)
        self.assertIn("Opted Out", conv.tags)

    def test_webhook_meta_error_block_handling(self):
        """Verify Meta error 131051 (user blocked business) marks contact as blocked"""
        conv = Conversation.objects.create(
            contact_name="Blocking User",
            phone_number="+919847088888",
            is_blocked=False
        )
        msg = Message.objects.create(
            conversation=conv,
            sender="agent",
            text="Service reminder",
            meta_message_id="wamid.test_blocked_msg_004"
        )
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "200012345678901",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "919876543210", "phone_number_id": "100012345678901"},
                        "statuses": [{
                            "id": "wamid.test_blocked_msg_004",
                            "status": "failed",
                            "timestamp": "1715500000",
                            "recipient_id": "919847088888",
                            "errors": [{
                                "code": 131051,
                                "title": "User has blocked business number"
                            }]
                        }]
                    }
                }]
            }]
        }
        resp = self.client.post('/api/conversations/webhook/', payload, format='json')
        self.assertEqual(resp.status_code, 200)

        conv.refresh_from_db()
        self.assertTrue(conv.is_blocked)
        self.assertIn("131051", conv.suppression_reason)


class SuppressionAndSendingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.normal_conv = Conversation.objects.create(
            contact_name="Normal Customer",
            phone_number="+919847011111",
            is_opted_out=False,
            is_blocked=False
        )
        self.opted_out_conv = Conversation.objects.create(
            contact_name="Opted Out Contact",
            phone_number="+919847022222",
            is_opted_out=True,
            suppression_reason="Customer sent STOP"
        )
        self.template = WhatsAppTemplate.objects.create(
            name="service_update",
            body="Hello {{1}}, your booking is {{2}}.",
            body_text="Hello {{1}}, your booking is {{2}}."
        )

    def test_send_message_normal_contact_allowed(self):
        """Sending freeform text to normal contact succeeds"""
        resp = self.client.post(f'/api/conversations/threads/{self.normal_conv.id}/send_message/', {
            'text': 'Hello, how can I help you today?'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_send_message_opted_out_contact_blocked(self):
        """Sending freeform text to opted-out contact is blocked by backend defense"""
        resp = self.client.post(f'/api/conversations/threads/{self.opted_out_conv.id}/send_message/', {
            'text': 'Special offer for you!'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("opted out", resp.data.get('error', '').lower())

    def test_send_message_opted_out_with_force_override(self):
        """Sending with explicit force=True allows override when consent is verified"""
        resp = self.client.post(f'/api/conversations/threads/{self.opted_out_conv.id}/send_message/', {
            'text': 'Here is the invoice you requested.',
            'force': True
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_send_template_opted_out_contact_blocked(self):
        """Sending WhatsApp template to opted-out contact is blocked by backend defense"""
        resp = self.client.post(f'/api/conversations/threads/{self.opted_out_conv.id}/send_template/', {
            'template_id': self.template.id,
            'variables': {'1': 'Customer', '2': 'Confirmed'}
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("opted out", resp.data.get('error', '').lower())

    def test_resubscribe_clears_suppression(self):
        """Re-subscribing a contact clears all suppression flags and tags"""
        resp = self.client.post('/api/conversations/threads/resubscribe/', {
            'id': self.opted_out_conv.id,
            'phone': self.opted_out_conv.phone_number
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.opted_out_conv.refresh_from_db()
        self.assertFalse(self.opted_out_conv.is_opted_out)
        self.assertFalse(self.opted_out_conv.is_blocked)
        self.assertEqual(self.opted_out_conv.suppression_reason, '')


class MetaServiceTests(TestCase):
    def test_template_name_validation(self):
        """Ensure Meta template name rules are strictly checked"""
        valid, _ = MetaWhatsAppService.validate_template_name("appointment_reminder_v2")
        self.assertTrue(valid)

        invalid1, _ = MetaWhatsAppService.validate_template_name("Appointment Reminder") # Capital & spaces
        self.assertFalse(invalid1)

        invalid2, _ = MetaWhatsAppService.validate_template_name("reminder-now") # Hyphen not allowed
        self.assertFalse(invalid2)

        invalid3, _ = MetaWhatsAppService.validate_template_name("") # Empty
        self.assertFalse(invalid3)
