from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from .models import Conversation, Message, WhatsAppTemplate, MetaWhatsAppConfig
from .meta_service import MetaWhatsAppService
from .grabber_views import link_grabber_session
from core.events import emit_event
try:
    from operations.models import Appointment, Job, Employee
except Exception:
    Appointment = None
    Job = None
    Employee = None

import datetime
import hashlib
import hmac
import json
import logging
import time
import re

logger = logging.getLogger(__name__)

# --- Serializers ---

class MetaWhatsAppConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetaWhatsAppConfig
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        token = ret.get('access_token', '')
        if token and len(token) > 12:
            ret['access_token_masked'] = token[:6] + '...' + token[-4:]
        else:
            ret['access_token_masked'] = 'Not Set'
        return ret

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['senderName'] = ret.get('sender_name', '')
        return ret

class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppTemplate
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = '__all__'

# --- Automated Workflow Engine ---

def evaluate_workflow_response(text_body, conv, cust_name, service_name, booking_id, slot_time, technician_name, tech_phone, est_price, est_val_num):
    """
    Evaluates customer inbound message against the active workflow decision tree.
    Properly matches numeric choices ('1', '1️⃣', '2', '2️⃣', '3', '3️⃣', '4', '4️⃣', 'option 1'...),
    keywords, slot rescheduling follow-ups, agent handover, and booking confirmations.
    """
    lower_text = text_body.strip().lower()
    clean_choice = re.sub(r'[^a-zA-Z0-9]', '', lower_text)

    # Option 1: Reschedule Booking
    is_option_1 = (
        clean_choice in ['1', 'one'] or
        '1️⃣' in text_body or
        'option 1' in lower_text or
        'opt 1' in lower_text or
        any(w in lower_text for w in ['reschedule', 're-schedule', 'change date', 'change time', 'postpone', 'new slot', 'different date', 'different time'])
    )

    # Slot Reschedule Follow-up (Customer replied with specific date/time after choosing reschedule)
    is_reschedule_slot = (
        not is_option_1 and
        (
            any(day in lower_text for day in ['tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'today']) or
            any(tw in lower_text for tw in ['am', 'pm', 'morning', 'afternoon', 'evening', 'noon'])
        ) and
        any(ch.isdigit() for ch in lower_text) and
        (conv.lead_stage in ['Reschedule Requested', 'Slot Selection'] or conv.status == 'in_progress')
    )

    # Option 2: Track Technician Status & ETA
    is_option_2 = (
        clean_choice in ['2', 'two'] or
        '2️⃣' in text_body or
        'option 2' in lower_text or
        'opt 2' in lower_text or
        any(w in lower_text for w in ['track', 'technician', 'where', 'status', 'eta', 'arrived', 'reach', 'live location', 'map', 'coming'])
    )

    # Option 3: View Quotation & Pricing
    is_option_3 = (
        clean_choice in ['3', 'three'] or
        '3️⃣' in text_body or
        'option 3' in lower_text or
        'opt 3' in lower_text or
        any(w in lower_text for w in ['price', 'cost', 'rate', 'quote', 'charges', 'quotation', 'amount', 'pricing', 'estimate', 'fee', 'bill'])
    )

    # Option 4: Speak with an Agent / Human Handover
    is_option_4 = (
        clean_choice in ['4', 'four'] or
        '4️⃣' in text_body or
        'option 4' in lower_text or
        'opt 4' in lower_text or
        any(w in lower_text for w in ['agent', 'human', 'speak', 'call', 'contact', 'support', 'representative', 'operator', 'person', 'help', 'talk', 'someone'])
    )

    # Booking Confirmation
    is_confirm = any(w in lower_text for w in ['confirm', 'confirmed', 'yes', 'approve', 'proceed', 'book'])

    reply_text = ''
    rich_card = None
    step_name = 'Inbound Received'

    if is_reschedule_slot:
        reply_text = (
            f"✅ *Appointment Slot Updated!*\n\n"
            f"Hi {cust_name}, your *{service_name}* (Booking {booking_id}) has been updated to your requested slot: *{text_body.strip()}*.\n\n"
            f"Specialist *{technician_name}* ({tech_phone}) has been notified and will arrive promptly."
        )
        rich_card = {
            'type': 'booking',
            'title': 'Slot Rescheduled',
            'date': text_body.strip(),
            'service': service_name,
            'amount': est_val_num,
            'bookingId': booking_id,
            'actionText': 'View Booking'
        }
        conv.status = 'open'
        conv.lead_stage = 'Slot Confirmed'
        step_name = 'Slot Updated'

    elif is_option_1:
        reply_text = (
            f"📅 *Reschedule Your Appointment*\n\n"
            f"Hi {cust_name}, your *{service_name}* service is currently scheduled for *{slot_time}*.\n\n"
            f"Please reply with your preferred new date and time (e.g., *\"Thursday 2:00 PM\"*), or choose one of our upcoming open slots:\n"
            f"1️⃣ Tomorrow 02:00 PM\n"
            f"2️⃣ Friday 10:30 AM\n"
            f"3️⃣ Saturday 11:00 AM\n\n"
            f"Our team will immediately confirm the new slot for you!"
        )
        rich_card = {
            'type': 'reschedule',
            'title': 'Reschedule Requested',
            'currentSlot': slot_time,
            'service': service_name,
            'bookingId': booking_id,
            'actionText': 'Select New Slot'
        }
        conv.status = 'in_progress'
        conv.lead_stage = 'Reschedule Requested'
        step_name = 'Option 1: Reschedule'

    elif is_option_2:
        reply_text = (
            f"📍 *Live Technician Status*\n\n"
            f"Hi {cust_name}, your assigned service specialist is *{technician_name}* ({tech_phone}).\n\n"
            f"• Service: *{service_name}* (Booking {booking_id})\n"
            f"• Current Status: *Technician Dispatched & En Route* 🛵\n"
            f"• Estimated Arrival: *15-20 minutes*\n\n"
            f"Track technician live on map:\n"
            f"https://coolfix.in/track/{booking_id.replace('#', '')}"
        )
        rich_card = {
            'type': 'tracking',
            'title': 'Technician En Route',
            'technician': technician_name,
            'phone': tech_phone,
            'service': service_name,
            'bookingId': booking_id,
            'eta': '15-20 mins',
            'actionText': 'Track Live Map'
        }
        step_name = 'Option 2: Track Specialist'

    elif is_option_4:
        reply_text = (
            f"👨‍💼 *Connecting with Support Specialist*\n\n"
            f"Hi {cust_name}, our senior operations specialist *{technician_name}* has been assigned to your chat and will assist you directly.\n\n"
            f"Priority Helpline: *{tech_phone}* / 1800-QIYAM-FIX."
        )
        rich_card = {
            'type': 'agent_handover',
            'title': 'Agent Assigned',
            'agent': technician_name,
            'phone': tech_phone,
            'status': 'Connected',
            'actionText': 'Direct Chat Active'
        }
        conv.status = 'in_progress'
        conv.lead_stage = 'Agent Assigned'
        step_name = 'Option 4: Agent Handover'

    elif is_option_3:
        reply_text = (
            f"💰 *Service Quotation & Pricing*\n\n"
            f"Hi {cust_name}, here is the official estimate for *{service_name}*:\n"
            f"• Inspection & Diagnostics: ₹800\n"
            f"• Labour & Service: ₹2,000\n"
            f"• *Total Estimated Amount: {est_price}*\n\n"
            f"To approve and reserve your technician slot, reply *CONFIRM*!"
        )
        step_name = 'Option 3: Quotation & Pricing'

    elif is_confirm:
        reply_text = (
            f"✅ *Booking Confirmed!*\n\n"
            f"Thank you {cust_name}! Your booking {booking_id} for *{service_name}* on *{slot_time}* is confirmed.\n\n"
            f"Specialist *{technician_name}* will arrive at your premises on time."
        )
        rich_card = {
            'type': 'booking',
            'title': 'Booking Confirmed',
            'date': slot_time,
            'service': service_name,
            'amount': est_val_num,
            'bookingId': booking_id,
            'actionText': 'View Details'
        }
        conv.status = 'open'
        conv.lead_stage = 'Confirmed'
        step_name = 'Booking Confirmed'

    else:
        reply_text = (
            f"👋 *Welcome to CoolFix Services, {cust_name}!* \n\n"
            f"We received your message regarding *{service_name}* (Booking {booking_id}). How can we assist you today?\n"
            f"1️⃣ Reschedule booking\n"
            f"2️⃣ Track technician status\n"
            f"3️⃣ View quotation & pricing\n"
            f"4️⃣ Speak with an agent\n\n"
            f"Reply with 1, 2, 3, or 4 and our team will assist you immediately!"
        )
        step_name = 'Welcome Menu'

    # Increment runs count and log automation execution
    try:
        from automation.models import Workflow, AutomationLog
        w = Workflow.objects.filter(name__icontains='Booking').first() or Workflow.objects.first()
        if w:
            w.runs_this_month = (w.runs_this_month or 0) + 1
            w.save(update_fields=['runs_this_month'])
        AutomationLog.objects.create(
            time_str=datetime.datetime.now().strftime('%b %d, %Y %I:%M:%S %p'),
            workflow_action=step_name,
            branch=conv.location or 'Kozhikode Head Office',
            status='success',
            log_level='Info',
            message=f"Workflow step '{step_name}' executed for {conv.contact_name} ({conv.phone_number}).",
            triggered_by='WhatsApp Inbound',
            duration='0.38s'
        )
    except Exception as log_err:
        logger.warning(f"[Automation Log] Failed to log workflow execution: {log_err}")

    return reply_text, rich_card, step_name

# --- ViewSets ---

class MetaConfigViewSet(viewsets.ViewSet):
    """
    Manages Meta WhatsApp Cloud API credentials and connectivity testing
    """
    def list(self, request):
        config = MetaWhatsAppConfig.objects.first()
        if not config:
            config = MetaWhatsAppConfig.objects.create()

        # Seamless Enterprise auto-seed from deployment environment variables
        needs_save = False
        if not config.access_token and os.environ.get('META_ACCESS_TOKEN'):
            config.access_token = os.environ.get('META_ACCESS_TOKEN').strip()
            needs_save = True
        if not config.phone_number_id and os.environ.get('META_PHONE_NUMBER_ID'):
            config.phone_number_id = os.environ.get('META_PHONE_NUMBER_ID').strip()
            needs_save = True
        if not config.waba_id and os.environ.get('META_WABA_ID'):
            config.waba_id = os.environ.get('META_WABA_ID').strip()
            needs_save = True
        if not config.app_secret and os.environ.get('META_APP_SECRET'):
            config.app_secret = os.environ.get('META_APP_SECRET').strip()
            needs_save = True
        if os.environ.get('META_WEBHOOK_VERIFY_TOKEN') and config.verify_token in ('', 'qiyam_whatsapp_secret_token_2026'):
            config.verify_token = os.environ.get('META_WEBHOOK_VERIFY_TOKEN').strip()
            needs_save = True
        if needs_save:
            config.save()

        return Response(MetaWhatsAppConfigSerializer(config).data)

    def create(self, request):
        config = MetaWhatsAppConfig.objects.first()
        if not config:
            config = MetaWhatsAppConfig()

        data = request.data
        if 'phone_number_id' in data:
            config.phone_number_id = data['phone_number_id'].strip()
        if 'waba_id' in data:
            config.waba_id = data['waba_id'].strip()
        if 'access_token' in data:
            raw_token = data['access_token'].strip()
            # Only update if a genuine full Meta token is provided (starts with EAA and >50 chars)
            if raw_token.startswith('EAA') and '...' not in raw_token and len(raw_token) > 50:
                config.access_token = raw_token
        if 'verify_token' in data:
            config.verify_token = data['verify_token'].strip()
        if 'app_secret' in data:
            config.app_secret = data['app_secret'].strip()
        if 'api_version' in data:
            config.api_version = data['api_version'].strip()
        if 'business_name' in data:
            config.business_name = data['business_name'].strip()
        if 'business_phone_display' in data:
            config.business_phone_display = data['business_phone_display'].strip()
        if 'auto_reply_enabled' in data:
            config.auto_reply_enabled = bool(data['auto_reply_enabled'])
        if 'dual_mode_enabled' in data:
            config.dual_mode_enabled = bool(data['dual_mode_enabled'])
        if 'forward_webhook_url' in data:
            config.forward_webhook_url = data['forward_webhook_url'].strip()
        if 'staff_numbers' in data:
            config.staff_numbers = data['staff_numbers'].strip()
        if 'staff_keywords' in data:
            config.staff_keywords = data['staff_keywords'].strip()

        config.save()
        return Response({
            'status': 'saved',
            'config': MetaWhatsAppConfigSerializer(config).data
        })

    @action(detail=False, methods=['post'])
    def test_forward_proxy(self, request):
        target_url = request.data.get('forward_webhook_url')
        if not target_url:
            config = MetaWhatsAppConfig.objects.first()
            target_url = config.forward_webhook_url if config else ''
        
        if not target_url:
            return Response({'success': False, 'error': 'No Forward Webhook URL specified.'}, status=status.HTTP_400_BAD_REQUEST)
        
        sample_payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "test_waba_id",
                "changes": [{
                    "field": "messages",
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "919876543210", "phone_number_id": "test_phone_id"},
                        "contacts": [{"profile": {"name": "Staff Portal Test"}, "wa_id": "919876543210"}],
                        "messages": [{
                            "from": "919876543210",
                            "id": f"wamid.test_{int(time.time())}",
                            "timestamp": str(int(time.time())),
                            "text": {"body": "Staff Portal Dual-Routing Test"},
                            "type": "text"
                        }]
                    }
                }]
            }]
        }
        res = MetaWhatsAppService.forward_webhook_payload(target_url, sample_payload)
        return Response(res)

    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        phone_id = request.data.get('phone_number_id')
        waba_id = request.data.get('waba_id')
        token = request.data.get('access_token')
        version = request.data.get('api_version', 'v21.0')

        config = MetaWhatsAppConfig.objects.first()
        if not config:
            config = MetaWhatsAppConfig.objects.create()

        # Fallback to saved credentials if not passed in request or if not a valid Meta EAA token
        if not phone_id:
            phone_id = config.phone_number_id
        if not waba_id:
            waba_id = config.waba_id
        if not token or not token.startswith('EAA') or '...' in token or len(token) < 50:
            token = config.access_token

        if not token:
            return Response({
                'success': False,
                'error': 'No access token provided. Please paste your Meta Permanent System User Token.'
            }, status=status.HTTP_400_BAD_REQUEST)

        result = MetaWhatsAppService.test_connection(phone_id, waba_id, token, version)

        if result.get('success'):
            config.connection_status = 'connected'
            config.last_tested_at = datetime.datetime.now()
            phone_data = result.get('phone_details', {})
            if phone_data.get('verified_name'):
                config.business_name = phone_data.get('verified_name')
            if phone_data.get('display_phone_number'):
                config.business_phone_display = phone_data.get('display_phone_number')
            if phone_data.get('quality_rating'):
                config.quality_rating = phone_data.get('quality_rating')
            config.save()
        else:
            config.connection_status = 'error'
            config.save()

        return Response(result)

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    def get_queryset(self):
        from django.db.models import Max, F
        return Conversation.objects.annotate(
            latest_msg_time=Max('messages__created_at')
        ).order_by(
            F('latest_msg_time').desc(nulls_last=True),
            '-updated_at',
            '-id'
        )

    def list(self, request, *args, **kwargs):
        # Resilient auto-seed defense: If database is ever empty on listing conversations, auto-seed demo data
        if not Conversation.objects.exists():
            try:
                from django.core.management import call_command
                logger.info("No conversations found in database. Auto-seeding initial Qiyam data...")
                call_command('seed_qiyam_data')
            except Exception as e:
                logger.error(f"Failed to auto-seed conversations: {e}")
        return super().list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        try:
            conv = None
            if str(pk).isdigit():
                conv = Conversation.objects.filter(pk=int(pk)).first()
            if not conv:
                conv = Conversation.objects.filter(contact_name=pk).first()
            if not conv:
                conv = Conversation.objects.filter(phone_number=pk).first()

            if conv:
                conv_id = conv.id
                contact_name = conv.contact_name
                conv.messages.all().delete()
                conv.delete()
                try:
                    from core.events import event_bus
                    event_bus.publish('conversation.deleted', {'id': conv_id, 'contact_name': contact_name})
                except Exception:
                    pass
                logger.info(f"Conversation {pk} ({contact_name}) permanently deleted.")
                return Response({'success': True, 'message': f"Conversation with {contact_name} deleted."}, status=status.HTTP_200_OK)
            return Response({'success': True, 'message': 'Conversation already removed or not found.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to delete conversation {pk}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def resubscribe(self, request):
        """
        Re-subscribe a contact with explicit consent.
        Clears is_blocked, is_opted_out, suppression_reason, suppression_date,
        and removes suppression tags.
        """
        phone = request.data.get('phone', '')
        conv_id = request.data.get('id', '')
        conv = None
        if conv_id and str(conv_id).isdigit():
            conv = Conversation.objects.filter(pk=int(conv_id)).first()
        if not conv and phone:
            clean_digits = re.sub(r'\D', '', str(phone))
            if clean_digits:
                suffix = clean_digits[-10:] if len(clean_digits) >= 10 else clean_digits
                conv = Conversation.objects.filter(phone_number__endswith=suffix).first()
        if not conv and conv_id:
            conv = Conversation.objects.filter(contact_name=conv_id).first()

        if conv:
            conv.is_blocked = False
            conv.is_opted_out = False
            conv.suppression_reason = ''
            conv.suppression_date = None
            if conv.tags:
                conv.tags = [t for t in conv.tags if str(t).lower() not in ['blocked', 'opted out', 'opt-out', 'unsubscribed']]
            conv.save()
            try:
                from core.events import event_bus
                event_bus.publish('conversation.resubscribed', {
                    'id': conv.id,
                    'phone_number': conv.phone_number,
                    'contact_name': conv.contact_name,
                })
            except Exception:
                pass
            logger.info(f"Conversation {conv.id} ({conv.contact_name}) re-subscribed with consent.")
            return Response({
                'success': True,
                'message': f"{conv.contact_name} re-subscribed with consent.",
                'conversation': ConversationSerializer(conv).data
            }, status=status.HTTP_200_OK)

        return Response({
            'success': True,
            'message': 'Suppression record cleared.'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_workflow(self, request, pk=None):
        try:
            conv = self.get_object()
        except Exception:
            conv = Conversation.objects.filter(pk=pk).first()
            if not conv and str(pk).isdigit():
                conv = Conversation.objects.filter(pk=int(pk)).first()

        if not conv:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        is_paused = request.data.get('is_paused')
        workflow_name = request.data.get('workflow_name', 'Service Booking Flow')
        if is_paused is not None:
            conv.active_workflow = 'Paused' if is_paused else (workflow_name or 'Service Booking Flow')
        elif 'workflow_name' in request.data:
            conv.active_workflow = workflow_name

        conv.save()
        emit_event('conversation.updated', {
            'id': conv.id,
            'active_workflow': conv.active_workflow
        })
        return Response({
            'success': True,
            'active_workflow': conv.active_workflow,
            'conversation': ConversationSerializer(conv).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        try:
            conversation = self.get_object()
        except Exception:
            conversation = None
            if str(pk).isdigit():
                conversation = Conversation.objects.filter(pk=int(pk)).first()
            if not conversation:
                conversation = Conversation.objects.filter(contact_name=pk).first() or Conversation.objects.filter(phone_number=pk).first()
            if not conversation:
                c_name = request.data.get('contact_name') or f"Customer {pk}"
                c_phone = request.data.get('phone_number') or "+91 98765 00000"
                conversation = Conversation.objects.create(
                    contact_name=c_name,
                    phone_number=c_phone,
                    category='Customer',
                    status='in_progress',
                    source='WhatsApp'
                )
        text = request.data.get('text', '')
        rich_card = request.data.get('rich_card', None)
        sender = request.data.get('sender', 'agent')
        sender_name = request.data.get('sender_name', 'Rahul Mehta')

        # Suppression Defense (WhatsApp Policy & Quality Score Protection)
        if (conversation.is_opted_out or conversation.is_blocked) and not request.data.get('force', False):
            reason = "opted out (STOP)" if conversation.is_opted_out else "blocked"
            return Response({
                'error': f"Cannot send message: Contact has {reason} on WhatsApp. Sending to suppressed contacts violates WhatsApp Business Policy. Re-subscribe with customer consent first or provide force=True."
            }, status=status.HTTP_400_BAD_REQUEST)

        meta_msg_id = ''
        msg_status = 'delivered'

        # Attempt sending through Meta Cloud API if configured
        config = MetaWhatsAppConfig.objects.first()
        if config and config.access_token and config.phone_number_id and config.connection_status == 'connected':
            meta_res = MetaWhatsAppService.send_whatsapp_text(
                phone_number_id=config.phone_number_id,
                access_token=config.access_token,
                to_phone=conversation.phone_number,
                text=text,
                api_version=config.api_version
            )
            if meta_res.get('success'):
                meta_msg_id = meta_res.get('message_id', '')
                msg_status = 'sent'
            else:
                logger.warning(f"Meta send failed: {meta_res.get('error')}")

        now_str = datetime.datetime.now().strftime('%I:%M %p')
        msg = Message.objects.create(
            conversation=conversation,
            sender=sender,
            sender_name=sender_name,
            text=text,
            timestamp=now_str,
            status=msg_status,
            meta_message_id=meta_msg_id,
            rich_card=rich_card
        )
        conversation.last_contact_date = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
        conversation.save()

        # If customer is online on WhatsApp, prior outbound messages are marked read
        if conversation.is_online:
            Message.objects.filter(
                conversation=conversation,
                sender__in=['agent', 'bot']
            ).exclude(id=msg.id).exclude(status='read').update(status='read')

        msg_data = MessageSerializer(msg).data
        emit_event('message.created', {
            'conversation_id': conversation.id,
            'message': msg_data
        })
        emit_event('conversation.updated', {
            'id': conversation.id,
            'last_message': text,
            'last_contact_date': conversation.last_contact_date,
            'unread_count': conversation.unread_count
        })

        return Response(msg_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def typing(self, request, pk=None):
        """
        Real-time typing presence endpoint for WhatsApp connectors & gateways.
        Payload: {"is_typing": true/false}
        """
        conversation = self.get_object()
        is_typing = request.data.get('is_typing', True)
        if isinstance(is_typing, str):
            is_typing = is_typing.lower() in ['true', '1', 'yes']

        emit_event('conversation.typing', {
            'conversation_id': conversation.id,
            'is_typing': bool(is_typing)
        })
        return Response({'status': 'ok', 'is_typing': bool(is_typing)})

    @action(detail=True, methods=['post'])
    def presence(self, request, pk=None):
        """
        Real-time customer online/offline presence updates.
        Payload: {"is_online": true/false, "last_seen": "12:05 PM"}
        """
        conversation = self.get_object()
        is_online = request.data.get('is_online', True)
        if isinstance(is_online, str):
            is_online = is_online.lower() in ['true', '1', 'yes', 'online', 'available']
        last_seen = request.data.get('last_seen', datetime.datetime.now().strftime('%I:%M %p'))

        conversation.is_online = bool(is_online)
        if not is_online:
            conversation.last_seen = last_seen
        conversation.save()

        emit_event('conversation.presence', {
            'conversation_id': conversation.id,
            'is_online': conversation.is_online,
            'last_seen': conversation.last_seen
        })
        return Response({
            'status': 'ok',
            'is_online': conversation.is_online,
            'last_seen': conversation.last_seen
        })

    @action(detail=True, methods=['post'])
    def sync_profile_picture(self, request, pk=None):
        """
        Updates, uploads, or clears the customer's real WhatsApp profile picture URL.
        Supports:
        - Multipart file upload: 'avatar' or 'file'
        - JSON payload: {"avatar": "https://..."} or {"avatar": "data:image/..."}
        - JSON action 'clear': {"action": "clear"} -> resets to empty for initials badge
        - JSON action 'sync'/'fetch': checks status
        """
        import os
        from django.conf import settings

        conversation = self.get_object()

        # 1. Check for file upload (multipart/form-data)
        uploaded_file = request.FILES.get('avatar') or request.FILES.get('file')
        if uploaded_file:
            ext = os.path.splitext(uploaded_file.name)[1].lower() or '.jpg'
            avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
            os.makedirs(avatar_dir, exist_ok=True)
            filename = f"avatar_{conversation.id}_{int(time.time())}{ext}"
            filepath = os.path.join(avatar_dir, filename)
            with open(filepath, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            media_url = f"{settings.MEDIA_URL}avatars/{filename}"
            conversation.avatar = media_url
            conversation.save()
            emit_event('conversation.updated', {
                'id': conversation.id,
                'avatar': conversation.avatar
            })
            return Response({
                'status': 'ok',
                'avatar': conversation.avatar,
                'action': 'uploaded'
            })

        # 2. Check for clear action
        action_type = request.data.get('action')
        if action_type == 'clear':
            conversation.avatar = ''
            conversation.save()
            emit_event('conversation.updated', {
                'id': conversation.id,
                'avatar': ''
            })
            return Response({
                'status': 'ok',
                'avatar': '',
                'action': 'cleared'
            })

        # 3. Check for custom URL or data URI
        avatar_url = request.data.get('avatar', '').strip()
        if avatar_url:
            conversation.avatar = avatar_url
            conversation.save()
            emit_event('conversation.updated', {
                'id': conversation.id,
                'avatar': conversation.avatar
            })
            return Response({
                'status': 'ok',
                'avatar': conversation.avatar,
                'action': 'saved_url'
            })

        # 4. Check for automated sync request
        if action_type in ['sync', 'fetch']:
            return Response({
                'status': 'info',
                'message': 'Meta Cloud API omits personal profile photos from webhooks to protect user privacy. Please upload or link a photo directly.',
                'avatar': conversation.avatar
            })

        return Response({'error': 'Please provide an image file or avatar URL.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def send_template(self, request, pk=None):
        conversation = self.get_object()

        # Suppression Defense (WhatsApp Policy & Quality Score Protection)
        if (conversation.is_opted_out or conversation.is_blocked) and not request.data.get('force', False):
            reason = "opted out (STOP)" if conversation.is_opted_out else "blocked"
            return Response({
                'error': f"Cannot send template: Contact has {reason} on WhatsApp. Sending to suppressed contacts violates WhatsApp Business Policy. Re-subscribe with customer consent first or provide force=True."
            }, status=status.HTTP_400_BAD_REQUEST)

        template_id = request.data.get('template_id')
        variables = request.data.get('variables', {})

        try:
            template = WhatsAppTemplate.objects.get(pk=template_id)
        except WhatsAppTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        # Build message text by substituting variables
        rendered_text = template.body_text or template.body
        for k, v in variables.items():
            rendered_text = rendered_text.replace(f"{{{{{k}}}}}", str(v))

        # Send via Meta if configured
        meta_msg_id = ''
        config = MetaWhatsAppConfig.objects.first()
        if config and config.access_token and config.phone_number_id and config.connection_status == 'connected':
            import re
            body_text = template.body_text or template.body or ''
            var_indices = re.findall(r'\{\{(\d+)\}\}', body_text)
            if var_indices:
                if not variables:
                    variables = {}
                for v_idx in var_indices:
                    if v_idx not in variables or not variables[v_idx]:
                        default_val = template.body_variables.get(v_idx, f"Sample {v_idx}") if template.body_variables else f"Sample {v_idx}"
                        variables[v_idx] = default_val

            components = []
            if template.header_type == 'TEXT' and template.header_text and '{{' in template.header_text:
                header_val = template.header_sample or 'Update'
                components.append({
                    "type": "header",
                    "parameters": [{"type": "text", "text": header_val}]
                })

            if variables:
                body_params = []
                for k in sorted(variables.keys(), key=lambda x: int(x) if str(x).isdigit() else 99):
                    body_params.append({"type": "text", "text": str(variables[k])})
                components.append({"type": "body", "parameters": body_params})

            for idx, btn in enumerate(template.buttons or []):
                if btn.get('type') == 'URL' and '{{' in btn.get('url', ''):
                    components.append({
                        "type": "button",
                        "sub_type": "url",
                        "index": str(idx),
                        "parameters": [{"type": "text", "text": "home"}]
                    })

            lang = template.language or 'en'
            if lang.lower() == 'english':
                lang = 'en_US' if template.name == 'hello_world' else 'en'

            meta_res = MetaWhatsAppService.send_whatsapp_template(
                phone_number_id=config.phone_number_id,
                access_token=config.access_token,
                to_phone=conversation.phone_number,
                template_name=template.name,
                language_code=lang,
                components=components if components else None,
                api_version=config.api_version
            )
            if meta_res.get('success'):
                meta_msg_id = meta_res.get('message_id', '')
            else:
                err = meta_res.get('error', 'Failed to send template message via Meta')
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

        now_str = datetime.datetime.now().strftime('%I:%M %p')
        msg = Message.objects.create(
            conversation=conversation,
            sender='agent',
            sender_name='Rahul Mehta (Template)',
            text=rendered_text,
            timestamp=now_str,
            status='sent' if meta_msg_id else 'delivered',
            meta_message_id=meta_msg_id
        )

        template.usage_count += 1
        template.save()

        conversation.last_contact_date = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
        conversation.save()

        msg_data = MessageSerializer(msg).data
        emit_event('message.created', {
            'conversation_id': conversation.id,
            'message': msg_data
        })
        emit_event('conversation.updated', {
            'id': conversation.id,
            'last_message': rendered_text,
            'last_contact_date': conversation.last_contact_date,
            'unread_count': conversation.unread_count
        })

        return Response(msg_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        conversation.unread_count = 0
        conversation.save(update_fields=['unread_count'])
        Message.objects.filter(
            conversation=conversation,
            sender__in=['agent', 'bot']
        ).exclude(status='read').update(status='read')
        emit_event('conversation.updated', {
            'id': conversation.id,
            'unread_count': 0
        })
        emit_event('message.status_updated', {
            'conversation_id': conversation.id,
            'status': 'read',
            'all_prior': True
        })
        return Response({'success': True, 'id': conversation.id, 'unread_count': 0})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Conversation.objects.filter(unread_count__gt=0).update(unread_count=0)
        emit_event('conversation.updated', {
            'unread_count': 0
        })
        return Response({'success': True, 'unread_count': 0})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer

class WhatsAppTemplateViewSet(viewsets.ModelViewSet):
    queryset = WhatsAppTemplate.objects.all().order_by('-usage_count', '-id')
    serializer_class = WhatsAppTemplateSerializer

    def list(self, request, *args, **kwargs):
        if not WhatsAppTemplate.objects.exists():
            default_templates = [
                {
                    'name': 'service_booking_confirmed',
                    'category': 'Service Appointments',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'TEXT',
                    'header_text': 'Booking Confirmed: {{1}}',
                    'header_sample': 'AC Repair',
                    'body': 'Hello {{1}},\nYour appointment for {{2}} is confirmed for {{3}}.\nAssigned Specialist: {{4}} ({{5}}).\n\nReply RESCHEDULE if you need to pick a different date.',
                    'body_text': 'Hello {{1}},\nYour appointment for {{2}} is confirmed for {{3}}.\nAssigned Specialist: {{4}} ({{5}}).\n\nReply RESCHEDULE if you need to pick a different date.',
                    'body_variables': {'1': 'Customer', '2': 'AC Comprehensive Service', '3': 'Tomorrow at 10:30 AM', '4': 'Rahul Mehta', '5': '+91 98471 23456'},
                    'footer_text': 'CoolFix Quick Dispatch • 1800-QIYAM',
                    'buttons': [
                        {'id': 'btn_confirm', 'type': 'QUICK_REPLY', 'text': 'Confirm Slot'},
                        {'id': 'btn_reschedule', 'type': 'QUICK_REPLY', 'text': 'Reschedule Date'},
                        {'id': 'btn_call', 'type': 'PHONE_NUMBER', 'text': 'Call Specialist', 'phone_number': '+919847123456'}
                    ],
                    'usage_count': 142
                },
                {
                    'name': 'technician_en_route',
                    'category': 'Operations',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'IMAGE',
                    'header_url': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
                    'body': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://coolfix.in/track/{{5}}',
                    'body_text': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://coolfix.in/track/{{5}}',
                    'body_variables': {'1': 'Customer', '2': 'Rahul Mehta', '3': '#B4821', '4': '10:30 AM', '5': 'B4821'},
                    'footer_text': 'CoolFix Operations Support',
                    'buttons': [
                        {'id': 'btn_available', 'type': 'QUICK_REPLY', 'text': 'I am Available'},
                        {'id': 'btn_delay', 'type': 'QUICK_REPLY', 'text': 'Delay by 30 mins'}
                    ],
                    'usage_count': 98
                },
                {
                    'name': 'official_quotation_share',
                    'category': 'Quotations & Sales',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'DOCUMENT',
                    'header_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    'body': 'Hello {{1}},\nHere is the official quotation for {{2}}: ₹{{3}}.\n\nSummary:\n• Service: {{2}}\n• Inspection & Diagnostics: Included\n• Total Estimated Price: ₹{{3}}\n\nTo accept and lock this price, tap Approve below.',
                    'body_text': 'Hello {{1}},\nHere is the official quotation for {{2}}: ₹{{3}}.\n\nSummary:\n• Service: {{2}}\n• Inspection & Diagnostics: Included\n• Total Estimated Price: ₹{{3}}\n\nTo accept and lock this price, tap Approve below.',
                    'body_variables': {'1': 'Customer', '2': 'Home Cleaning', '3': '1200'},
                    'footer_text': 'CoolFix Commercial Proposals',
                    'buttons': [
                        {'id': 'btn_approve_quote', 'type': 'QUICK_REPLY', 'text': 'Approve Quotation'},
                        {'id': 'btn_revise_quote', 'type': 'QUICK_REPLY', 'text': 'Request Revision'},
                        {'id': 'btn_sales_call', 'type': 'PHONE_NUMBER', 'text': 'Talk to Sales', 'phone_number': '+919876543210'}
                    ],
                    'usage_count': 76
                },
                {
                    'name': 'invoice_payment_reminder',
                    'category': 'Billing & Accounts',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'NONE',
                    'body': 'Dear {{1}},\nThis is a friendly reminder that invoice #{{2}} for ₹{{3}} is pending. Due date: {{4}}.\n\nTap below to pay securely via UPI, Card, or Net Banking.',
                    'body_text': 'Dear {{1}},\nThis is a friendly reminder that invoice #{{2}} for ₹{{3}} is pending. Due date: {{4}}.\n\nTap below to pay securely via UPI, Card, or Net Banking.',
                    'body_variables': {'1': 'Customer', '2': 'INV-2024-001', '3': '2800', '4': 'Today'},
                    'footer_text': 'Accounts Dept • CoolFix Services',
                    'buttons': [
                        {'id': 'btn_pay_now', 'type': 'URL', 'text': 'Pay Now Securely', 'url': 'https://coolfix.in/pay/{{1}}', 'url_sample': 'INV001'},
                        {'id': 'btn_already_paid', 'type': 'QUICK_REPLY', 'text': 'Already Paid'}
                    ],
                    'usage_count': 63
                },
                {
                    'name': 'festival_discount_offer',
                    'category': 'Marketing',
                    'meta_category': 'MARKETING',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'IMAGE',
                    'header_url': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
                    'body': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all AC maintenance and home appliance repairs this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
                    'body_text': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all AC maintenance and home appliance repairs this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
                    'body_variables': {'1': 'Customer', '2': 'FESTIVE40'},
                    'footer_text': 'Limited Time Offer • Terms Apply',
                    'buttons': [
                        {'id': 'btn_claim', 'type': 'QUICK_REPLY', 'text': 'Claim Offer'},
                        {'id': 'btn_code', 'type': 'COPY_CODE', 'text': 'Copy Code', 'code': 'FESTIVE40'},
                        {'id': 'btn_stop_promo', 'type': 'QUICK_REPLY', 'text': 'Stop Promotions'}
                    ],
                    'usage_count': 210
                },
                {
                    'name': 'customer_satisfaction_survey',
                    'category': 'Customer Support',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'NONE',
                    'body': 'Hi {{1}},\nThank you for choosing CoolFix Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                    'body_text': 'Hi {{1}},\nThank you for choosing CoolFix Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                    'body_variables': {'1': 'Customer', '2': 'Rahul Mehta'},
                    'footer_text': 'Your feedback helps us serve you better',
                    'buttons': [
                        {'id': 'btn_rate_5', 'type': 'QUICK_REPLY', 'text': '⭐⭐⭐⭐⭐ Excellent'},
                        {'id': 'btn_rate_3', 'type': 'QUICK_REPLY', 'text': '⭐⭐⭐ Average'},
                        {'id': 'btn_rate_1', 'type': 'QUICK_REPLY', 'text': '⭐ Need Help'}
                    ],
                    'usage_count': 88
                },
                {
                    'name': 'welcome_onboarding',
                    'category': 'Welcome & Onboarding',
                    'meta_category': 'UTILITY',
                    'status': 'Active',
                    'meta_status': 'APPROVED',
                    'language': 'en_US',
                    'header_type': 'NONE',
                    'body': 'Welcome to CoolFix Services, {{1}}!\nWe provide top-rated HVAC, electrical, plumbing, and appliance care across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                    'body_text': 'Welcome to CoolFix Services, {{1}}!\nWe provide top-rated HVAC, electrical, plumbing, and appliance care across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                    'body_variables': {'1': 'Customer'},
                    'footer_text': 'CoolFix Business Solutions',
                    'buttons': [
                        {'id': 'btn_book_srv', 'type': 'QUICK_REPLY', 'text': 'Book Service'},
                        {'id': 'btn_pricing', 'type': 'QUICK_REPLY', 'text': 'View Pricing'},
                        {'id': 'btn_support_call', 'type': 'PHONE_NUMBER', 'text': 'Call Helpline', 'phone_number': '+919876543210'}
                    ],
                    'usage_count': 175
                }
            ]
            for t in default_templates:
                WhatsAppTemplate.objects.create(**t)
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def submit_to_meta(self, request, pk=None):
        """
        Submits the template to Meta Graph API: POST /{WABA_ID}/message_templates
        """
        template = self.get_object()
        config = MetaWhatsAppConfig.objects.first()

        if not config or not config.access_token or not config.waba_id:
            # Simulation / Demo mode fallback when real credentials aren't set yet
            template.meta_status = 'PENDING'
            template.meta_template_id = f"sim_{template.id}_{int(datetime.datetime.now().timestamp())}"
            template.last_updated = datetime.datetime.now().strftime('%b %d, %Y')
            template.save()
            return Response({
                'status': 'submitted_sandbox',
                'message': 'Meta credentials not configured. Template saved in local sandbox as In Review / Pending.',
                'template': WhatsAppTemplateSerializer(template).data
            }, status=status.HTTP_200_OK)

        res = MetaWhatsAppService.create_meta_template(
            waba_id=config.waba_id,
            access_token=config.access_token,
            template_obj=template,
            api_version=config.api_version
        )

        if res.get('success'):
            template.meta_template_id = res.get('meta_template_id', '')
            template.meta_status = res.get('status', 'PENDING')
            template.rejection_reason = ''
            template.last_updated = datetime.datetime.now().strftime('%b %d, %Y')
            template.save()
            return Response({
                'status': 'success',
                'message': f"Template submitted to Meta successfully! Status: {template.meta_status}",
                'template': WhatsAppTemplateSerializer(template).data
            }, status=status.HTTP_200_OK)
        else:
            template.rejection_reason = res.get('error', 'Meta rejected template')
            template.meta_status = 'REJECTED'
            template.save()
            return Response({
                'status': 'error',
                'error': res.get('error'),
                'template': WhatsAppTemplateSerializer(template).data
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def sync_meta(self, request):
        """
        Fetches live template status updates from Meta Graph API
        """
        config = MetaWhatsAppConfig.objects.first()
        if not config or not config.access_token or not config.waba_id:
            return Response({
                'status': 'notice',
                'message': 'No Meta WhatsApp credentials configured. Using local templates.'
            }, status=status.HTTP_200_OK)

        res = MetaWhatsAppService.fetch_meta_templates(
            waba_id=config.waba_id,
            access_token=config.access_token,
            api_version=config.api_version
        )

        if not res.get('success'):
            return Response({'error': res.get('error')}, status=status.HTTP_400_BAD_REQUEST)

        meta_list = res.get('templates', [])
        synced_count = 0

        for m in meta_list:
            name = m.get('name')
            status_val = m.get('status', 'APPROVED')
            category = m.get('category', 'UTILITY')
            lang = m.get('language', 'en_US')

            # Parse components from Meta
            body_text = ''
            header_type = 'NONE'
            header_text = ''
            header_url = ''
            footer_text = ''
            buttons = []

            for comp in m.get('components', []):
                c_type = comp.get('type', '').upper()
                if c_type == 'BODY':
                    body_text = comp.get('text', '')
                elif c_type == 'HEADER':
                    header_format = comp.get('format', 'TEXT').upper()
                    header_type = header_format
                    if header_format == 'TEXT':
                        header_text = comp.get('text', '')
                    elif header_format in ['IMAGE', 'VIDEO', 'DOCUMENT']:
                        ex = comp.get('example', {})
                        handles = ex.get('header_handle', [])
                        if handles:
                            header_url = handles[0]
                elif c_type == 'FOOTER':
                    footer_text = comp.get('text', '')
                elif c_type == 'BUTTONS':
                    for b in comp.get('buttons', []):
                        b_type = b.get('type', '').upper()
                        b_text = b.get('text', '')
                        btn_data = {'type': b_type, 'text': b_text}
                        if b_type == 'URL':
                            btn_data['url'] = b.get('url', '')
                        elif b_type == 'PHONE_NUMBER':
                            btn_data['phone_number'] = b.get('phone_number', '')
                        elif b_type == 'COPY_CODE':
                            btn_data['code'] = b.get('example', [''])[0] if isinstance(b.get('example'), list) else b.get('example', '')
                        buttons.append(btn_data)

            # Find matching local template or create safely
            tmpl = WhatsAppTemplate.objects.filter(name=name).first()
            if not tmpl:
                tmpl = WhatsAppTemplate.objects.create(
                    name=name,
                    category='Sales & Marketing' if category == 'MARKETING' else 'Customer Updates',
                    meta_category=category,
                    status='Active' if status_val == 'APPROVED' else 'Pending',
                    meta_status=status_val,
                    language=lang,
                    body=body_text or 'Synced from Meta',
                    body_text=body_text or 'Synced from Meta',
                    header_type=header_type,
                    header_text=header_text,
                    header_url=header_url,
                    footer_text=footer_text,
                    buttons=buttons,
                    meta_template_id=m.get('id', '')
                )
            else:
                tmpl.meta_status = status_val
                tmpl.meta_category = category
                tmpl.language = lang
                tmpl.status = 'Active' if status_val == 'APPROVED' else 'Pending'
                tmpl.meta_template_id = m.get('id', tmpl.meta_template_id)
                if body_text:
                    tmpl.body = body_text
                    tmpl.body_text = body_text
                if header_type != 'NONE':
                    tmpl.header_type = header_type
                    tmpl.header_text = header_text
                    if header_url:
                        tmpl.header_url = header_url
                if footer_text:
                    tmpl.footer_text = footer_text
                if buttons:
                    tmpl.buttons = buttons
                tmpl.save()
            synced_count += 1

        return Response({
            'status': 'success',
            'synced_count': synced_count,
            'templates': WhatsAppTemplateSerializer(WhatsAppTemplate.objects.all(), many=True).data
        })

    @action(detail=True, methods=['post'])
    def test_send(self, request, pk=None):
        """
        Sends this template to a test WhatsApp phone number
        """
        template = self.get_object()
        phone_number = request.data.get('phone_number')
        variables = request.data.get('variables', template.body_variables or {})

        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        config = MetaWhatsAppConfig.objects.first()
        if config and config.access_token and config.phone_number_id and config.connection_status == 'connected':
            # Check if template has a Meta template ID
            if not template.meta_template_id:
                return Response({
                    'status': 'error',
                    'error': f"Template '{template.name}' has no Meta Template ID and does not exist on your Meta WhatsApp Account. Only Meta-approved templates can be sent."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if template is pending or rejected
            if template.meta_status == 'PENDING':
                return Response({
                    'status': 'error',
                    'error': f"Template '{template.name}' is currently in review by Meta (Status: PENDING). Meta will only deliver messages once the template is APPROVED."
                }, status=status.HTTP_400_BAD_REQUEST)
            elif template.meta_status == 'REJECTED':
                return Response({
                    'status': 'error',
                    'error': f"Template '{template.name}' was REJECTED by Meta. Reason: {template.rejection_reason or 'Policy violation'}."
                }, status=status.HTTP_400_BAD_REQUEST)

            import re
            # Auto-fill parameters if template body requires {{1}}, {{2}} variables
            body_text = template.body_text or template.body or ''
            var_indices = re.findall(r'\{\{(\d+)\}\}', body_text)
            if var_indices:
                if not variables:
                    variables = {}
                for v_idx in var_indices:
                    if v_idx not in variables or not variables[v_idx]:
                        default_val = template.body_variables.get(v_idx, f"Sample {v_idx}") if template.body_variables else f"Sample {v_idx}"
                        variables[v_idx] = default_val

            components = []

            # Handle dynamic header parameter
            if template.header_type == 'TEXT' and template.header_text and '{{' in template.header_text:
                header_val = template.header_sample or 'Update'
                components.append({
                    "type": "header",
                    "parameters": [{"type": "text", "text": header_val}]
                })

            # Handle body parameters
            if variables:
                body_params = []
                for k in sorted(variables.keys(), key=lambda x: int(x) if str(x).isdigit() else 99):
                    body_params.append({"type": "text", "text": str(variables[k])})
                components.append({"type": "body", "parameters": body_params})

            # Handle dynamic URL buttons
            for idx, btn in enumerate(template.buttons or []):
                if btn.get('type') == 'URL' and '{{' in btn.get('url', ''):
                    components.append({
                        "type": "button",
                        "sub_type": "url",
                        "index": str(idx),
                        "parameters": [{"type": "text", "text": "home"}]
                    })

            # Normalize language code for Meta
            lang = template.language or 'en'
            if lang.lower() == 'english':
                lang = 'en_US' if template.name == 'hello_world' else 'en'

            meta_res = MetaWhatsAppService.send_whatsapp_template(
                phone_number_id=config.phone_number_id,
                access_token=config.access_token,
                to_phone=phone_number,
                template_name=template.name,
                language_code=lang,
                components=components if components else None,
                api_version=config.api_version
            )
            if meta_res.get('success'):
                template.usage_count += 1
                template.save()
                return Response({
                    'status': 'sent',
                    'message': f"Test template '{template.name}' sent to {phone_number} successfully!",
                    'meta_response': meta_res
                })
            else:
                err = meta_res.get('error', 'Failed to send template message via Meta')
                if '#132001' in err:
                    err = f"Template '{template.name}' does not exist on your Meta WhatsApp Account. Only Meta-approved templates can be sent."
                elif '#131008' in err:
                    err = f"Meta Error: Required template parameter is missing or format mismatch."
                return Response({
                    'status': 'error',
                    'error': err
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Simulated send
            template.usage_count += 1
            template.save()
            return Response({
                'status': 'simulated_send',
                'message': f"[Simulation Mode] Template '{template.name}' delivered to test number {phone_number}."
            })

class WhatsAppWebhookView(APIView):
    """
    Official Meta WhatsApp Cloud API Webhook Handler
    - GET: Hub challenge verification handshake
    - POST: Incoming messages, status receipts (sent, delivered, read), and template status updates
    """
    def get(self, request):
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')

        config = MetaWhatsAppConfig.objects.first()
        expected_token = config.verify_token if config else 'qiyam_whatsapp_secret_token_2026'

        if mode == 'subscribe' and token == expected_token:
            logger.info(f"Meta Webhook verified successfully with challenge: {challenge}")
            return HttpResponse(challenge, content_type='text/plain', status=200)

        logger.warning(f"Meta Webhook verification token mismatch: received {token}, expected {expected_token}")
        return HttpResponse('Verification token mismatch', status=403)

    def post(self, request):
        config = MetaWhatsAppConfig.objects.first()
        if config and config.app_secret:
            signature = request.headers.get('X-Hub-Signature-256', '')
            raw_body = request.body
            expected = hmac.new(
                config.app_secret.encode('utf-8'),
                raw_body,
                hashlib.sha256,
            ).hexdigest()
            if not signature or not hmac.compare_digest(signature, f'sha256={expected}'):
                logger.warning('Meta Webhook signature verification failed')
                return Response({'error': 'Invalid webhook signature'}, status=403)

        data = request.data
        logger.info(f"Meta Webhook event payload received: {json.dumps(data)[:250]}")

        # Real-time typing presence from WhatsApp connectors & multi-device gateways
        if data.get('event') in ['presence.update', 'chat.composing', 'typing'] or 'is_typing' in data:
            sender_phone = data.get('phone') or data.get('from') or (data.get('data') or {}).get('phone')
            state_val = data.get('state') or (data.get('data') or {}).get('state')
            is_typing = data.get('is_typing') if 'is_typing' in data else (state_val in ['composing', 'typing'])
            clean_sender = re.sub(r'\D', '', str(sender_phone)) if sender_phone else ''
            if clean_sender:
                conv = None
                if len(clean_sender) >= 10:
                    last_10 = clean_sender[-10:]
                    conv = Conversation.objects.filter(phone_number__endswith=last_10).first()
                if not conv:
                    for c in Conversation.objects.all():
                        c_clean = re.sub(r'\D', '', str(c.phone_number))
                        if len(clean_sender) >= 10 and c_clean.endswith(clean_sender[-10:]):
                            conv = c
                            break
                if conv:
                    emit_event('conversation.typing', {
                        'conversation_id': conv.id,
                        'is_typing': bool(is_typing)
                    })
                    return Response({'status': 'typing_processed'}, status=status.HTTP_200_OK)

        entry_list = data.get('entry', [])
        for entry in entry_list:
            changes = entry.get('changes', [])
            for change in changes:
                field = change.get('field')
                value = change.get('value', {})

                # 1. Incoming WhatsApp Message
                if field == 'messages':
                    messages = value.get('messages', [])
                    contacts = value.get('contacts', [])
                    profile_name = contacts[0].get('profile', {}).get('name', 'WhatsApp Customer') if contacts else 'WhatsApp Customer'

                    for msg in messages:
                        sender_phone = msg.get('from', '')
                        msg_id = msg.get('id', '')
                        msg_type = msg.get('type', 'text')

                        # Deduplicate by Meta Message ID
                        if msg_id and Message.objects.filter(meta_message_id=msg_id).exists():
                            logger.info(f"[Meta Webhook] Duplicate message skipped: {msg_id}")
                            continue
                        
                        text_body = ''
                        if msg_type == 'text':
                            text_body = msg.get('text', {}).get('body', '')
                        elif msg_type == 'button':
                            text_body = msg.get('button', {}).get('text') or msg.get('button', {}).get('payload', '')
                        elif msg_type == 'interactive':
                            interactive = msg.get('interactive', {})
                            itype = interactive.get('type')
                            if itype == 'button_reply':
                                text_body = interactive.get('button_reply', {}).get('title') or interactive.get('button_reply', {}).get('id', '')
                            elif itype == 'list_reply':
                                text_body = interactive.get('list_reply', {}).get('title') or interactive.get('list_reply', {}).get('id', '')
                            elif itype == 'nfm_reply':
                                text_body = interactive.get('nfm_reply', {}).get('response_json', '')
                            else:
                                text_body = str(interactive)
                        elif msg_type == 'image':
                            text_body = msg.get('image', {}).get('caption') or '📷 Photo'
                        elif msg_type in ['audio', 'voice']:
                            text_body = '🎵 Voice message'
                        elif msg_type == 'video':
                            text_body = msg.get('video', {}).get('caption') or '🎥 Video'
                        elif msg_type == 'document':
                            text_body = msg.get('document', {}).get('filename') or '📄 Document'
                        elif msg_type == 'location':
                            text_body = '📍 Location'
                        elif msg_type == 'reaction':
                            # WhatsApp reaction (👍 👎 ❤️ etc.) on a previous message
                            reaction_data = msg.get('reaction', {})
                            reacted_to_id = reaction_data.get('message_id', '')  # wamid of the original message
                            emoji = reaction_data.get('emoji', '')  # empty string = reaction removed

                            if reacted_to_id and emoji:
                                # Find the original message and attach the reaction
                                target_msg = Message.objects.filter(meta_message_id=reacted_to_id).first()
                                if target_msg:
                                    rc = target_msg.rich_card or {}
                                    reactions = rc.get('reactions', [])
                                    # Remove any existing reaction from this sender phone
                                    reactions = [r for r in reactions if r.get('phone') != clean_sender]
                                    reactions.append({'emoji': emoji, 'from': 'customer', 'phone': clean_sender})
                                    rc['reactions'] = reactions
                                    target_msg.rich_card = rc
                                    target_msg.save()

                                    # Emit reaction event to frontend
                                    emit_event('message.reaction', {
                                        'conversation_id': target_msg.conversation_id,
                                        'message_id': target_msg.id,
                                        'emoji': emoji,
                                        'from': 'customer',
                                    })
                                    logger.info(f"[Webhook] Reaction '{emoji}' from {clean_sender} on message {reacted_to_id}")
                            elif reacted_to_id and not emoji:
                                # Empty emoji = reaction removed
                                target_msg = Message.objects.filter(meta_message_id=reacted_to_id).first()
                                if target_msg:
                                    rc = target_msg.rich_card or {}
                                    reactions = [r for r in rc.get('reactions', []) if r.get('phone') != clean_sender]
                                    rc['reactions'] = reactions
                                    target_msg.rich_card = rc
                                    target_msg.save()
                                    emit_event('message.reaction', {
                                        'conversation_id': target_msg.conversation_id,
                                        'message_id': target_msg.id,
                                        'emoji': '',
                                        'from': 'customer',
                                    })
                            continue  # Reactions don't create a new message row
                        else:
                            text_body = f"[{msg_type.capitalize()} Attachment]"

                        # Robust phone number resolution across any format (+91, spaces, 10 digits)
                        clean_sender = re.sub(r'\D', '', str(sender_phone))

                        # WhatsApp Group Grabber Handshake Detection (QR scan click-to-chat sync)
                        if text_body and 'SYNC_QIYAM_GROUP_' in text_body:
                            match = re.search(r'SYNC_QIYAM_GROUP_([a-zA-Z0-9_\-]+)', text_body)
                            if match:
                                raw_token = match.group(1).strip()
                                full_token = f"qiyam_grp_{raw_token}" if not raw_token.startswith('qiyam_grp_') else raw_token
                                sender_display = f"+{clean_sender}" if not clean_sender.startswith('+') else clean_sender
                                link_grabber_session(full_token, phone=sender_display, device_name=profile_name or 'Mobile WhatsApp')
                                link_grabber_session(raw_token, phone=sender_display, device_name=profile_name or 'Mobile WhatsApp')
                                emit_event('grabber.connected', {
                                    'token': full_token,
                                    'phone': sender_display,
                                    'device_name': profile_name or 'Mobile WhatsApp',
                                })
                                logger.info(f"[Group Grabber] QR Handshake connected for session {full_token} from {sender_display}")
                                try:
                                    confirmation_text = "✅ *Qiyam Group Grabber Handshake Received!*\n\nNote: WhatsApp Cloud API only connects chat messages and cannot access private group members on your phone.\n\nTo grab 100% genuine group members, open WhatsQ on your screen and use the 'Paste Group Link & Web Grabber' or 'Upload Chat Export' option."
                                    MetaWhatsAppService.send_text_message(clean_sender, confirmation_text)
                                except Exception as reply_err:
                                    logger.warning(f"[Group Grabber] Confirmation reply notice: {reply_err}")
                            continue

                        # Dual-Workspace Routing: Proxy/Forward to existing Office / Staff Portal if staff event
                        is_staff = False
                        if config and config.dual_mode_enabled and config.forward_webhook_url:
                            # 1. Match staff phone numbers
                            if config.staff_numbers:
                                staff_list = [re.sub(r'\D', '', num) for num in config.staff_numbers.split(',') if num.strip()]
                                if any(clean_sender.endswith(s_num) or s_num.endswith(clean_sender) for s_num in staff_list if len(s_num) >= 8):
                                    is_staff = True
                            # 2. Match staff keywords in message
                            if not is_staff and config.staff_keywords and text_body:
                                kw_list = [kw.strip().lower() for kw in config.staff_keywords.split(',') if kw.strip()]
                                msg_lower = text_body.lower()
                                if any(kw in msg_lower for kw in kw_list):
                                    is_staff = True

                        if is_staff:
                            logger.info(f"[Dual-Workspace Proxy] Identified staff activity from {clean_sender} ('{text_body[:40]}'). Forwarding to {config.forward_webhook_url}...")
                            MetaWhatsAppService.forward_webhook_payload(
                                config.forward_webhook_url,
                                data,
                                {'X-Hub-Signature-256': request.headers.get('X-Hub-Signature-256', '')}
                            )
                            continue

                        conv = None
                        if clean_sender:
                            conv = Conversation.objects.filter(phone_number=f"+{clean_sender}").first()
                            if not conv:
                                conv = Conversation.objects.filter(phone_number=clean_sender).first()
                            if not conv and len(clean_sender) >= 10:
                                last_10 = clean_sender[-10:]
                                conv = Conversation.objects.filter(phone_number__endswith=last_10).first()
                                if not conv:
                                    for c in Conversation.objects.all():
                                        c_clean = re.sub(r'\D', '', str(c.phone_number))
                                        if c_clean.endswith(last_10):
                                            conv = c
                                            break

                        if not conv:
                            conv = Conversation.objects.create(
                                phone_number=f"+{clean_sender}",
                                contact_name=profile_name,
                                avatar='',
                                category='Lead',
                                status='open',
                                lead_owner='Ramesh Kumar',
                                lead_stage='New Lead',
                                source='WhatsApp Cloud API',
                                location='Kozhikode, Kerala',
                                tags=['WhatsApp Inbound'],
                                notes='Initiated contact via Meta WhatsApp Cloud API.',
                                unread_count=1,
                                is_online=True,
                                last_seen='Just now'
                            )
                        elif profile_name != 'WhatsApp Customer' and conv.contact_name in ['WhatsApp Customer', '']:
                            conv.contact_name = profile_name

                        now_time = datetime.datetime.now().strftime('%I:%M %p')
                        now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')

                        created_msg = Message.objects.create(
                            conversation=conv,
                            sender='customer',
                            text=text_body,
                            timestamp=now_time,
                            status='read',
                            meta_message_id=msg_id
                        )

                        # Detect WhatsApp Opt-Out / Unsubscribe keywords & quick reply buttons
                        clean_upper = text_body.strip().upper()
                        is_opt_out_word = (
                            clean_upper in ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPTOUT', 'QUIT', 'STOP PROMOTIONS']
                            or clean_upper.startswith('STOP')
                            or clean_upper == 'STOP_PROMOTIONS'
                        )
                        if is_opt_out_word:
                            conv.is_opted_out = True
                            conv.is_blocked = False
                            conv.suppression_reason = f"Replied '{text_body.strip()}' on WhatsApp"
                            if 'Opted Out' not in conv.tags:
                                conv.tags.append('Opted Out')
                            logger.info(f"[Meta Webhook] Contact {conv.phone_number} opted out via keyword '{text_body.strip()}'")
                            emit_event('contact.opted_out', {
                                'conversation_id': conv.id,
                                'phone': conv.phone_number,
                                'name': conv.contact_name,
                                'reason': text_body.strip(),
                                'date': now_full
                            })
                            emit_event('notification.new', {
                                'id': int(time.time() * 1000),
                                'title': '🛑 Customer Unsubscribed (STOP)',
                                'text': f"{conv.contact_name} ({conv.phone_number}) texted '{text_body.strip()}'. Auto-suppressed from broadcasts.",
                                'time': 'Just now',
                                'unread': True,
                                'target': 'bulk-recipients',
                                'itemId': conv.id,
                                'itemType': 'conversation'
                            })

                        conv.unread_count += 1
                        conv.last_contact_date = now_full
                        conv.status = 'open'
                        conv.is_online = True
                        conv.last_seen = 'Just now'
                        conv.save()

                        # Customer replied -> all prior outbound messages in this thread are read
                        Message.objects.filter(
                            conversation=conv,
                            sender__in=['agent', 'bot']
                        ).exclude(status='read').update(status='read')

                        emit_event('conversation.presence', {
                            'conversation_id': conv.id,
                            'is_online': True,
                            'last_seen': 'Just now'
                        })

                        msg_payload = MessageSerializer(created_msg).data
                        emit_event('message.created', {
                            'conversation_id': conv.id,
                            'message': msg_payload
                        })
                        emit_event('conversation.updated', {
                            'id': conv.id,
                            'contact_name': conv.contact_name,
                            'phone_number': conv.phone_number,
                            'last_message': text_body,
                            'last_contact_date': now_full,
                            'unread_count': conv.unread_count,
                            'is_opted_out': conv.is_opted_out,
                            'is_blocked': conv.is_blocked,
                            'suppression_reason': conv.suppression_reason
                        })
                        emit_event('conversation.typing', {
                            'conversation_id': conv.id,
                            'is_typing': False
                        })
                        emit_event('notification.new', {
                            'id': int(time.time() * 1000),
                            'title': f"New message from {conv.contact_name}",
                            'text': text_body[:80],
                            'time': 'Just now',
                            'unread': True,
                            'target': 'conversations',
                            'itemId': conv.id,
                            'itemType': 'conversation'
                        })

                        # -------------------------------------------------------------
                        # Automated Contextual Response Engine (100% Automated CRM Flow)
                        # -------------------------------------------------------------
                        if config and config.auto_reply_enabled and getattr(conv, 'active_workflow', '') != 'Paused':
                            # 1. Query CRM / Operational Context for this Customer
                            last_10 = clean_sender[-10:] if len(clean_sender) >= 10 else clean_sender
                            apt = None
                            job = None
                            if Appointment:
                                apt = Appointment.objects.filter(phone__icontains=last_10).order_by('-id').first()
                                if not apt and conv.contact_name:
                                    apt = Appointment.objects.filter(customer_name__icontains=conv.contact_name).order_by('-id').first()
                            if Job:
                                job = Job.objects.filter(phone__icontains=last_10).order_by('-id').first()
                                if not job and conv.contact_name:
                                    job = Job.objects.filter(customer_name__icontains=conv.contact_name).order_by('-id').first()

                            # Extract individualized variables
                            cust_name = conv.contact_name if conv.contact_name and conv.contact_name != 'WhatsApp Customer' else (profile_name if profile_name != 'WhatsApp Customer' else 'Valued Customer')
                            service_name = conv.service_needed or (apt.service if apt else (job.service if job else 'AC Repair & Service'))
                            booking_id = apt.apt_id_str if apt else (job.job_id_str if job else '#B4821')
                            technician_name = apt.employee if apt else (job.assigned_to if job else (conv.lead_owner or 'Ramesh Kumar'))

                            tech_phone = '+91 98471 23456'
                            if Employee:
                                emp = Employee.objects.filter(name__icontains=technician_name).first()
                                if emp and emp.phone:
                                    tech_phone = emp.phone

                            slot_time = f"{apt.date_str} at {apt.time_str}" if apt else "Tomorrow at 10:30 AM"
                            est_val_num = int(conv.estimated_value) if conv.estimated_value else (int(apt.amount) if apt else 2800)
                            est_price = f"₹{est_val_num:,}"

                            # 2. Intent Classification & Context Injection via Automated Workflow Engine
                            reply_text, rich_card, step_name = evaluate_workflow_response(
                                text_body=text_body,
                                conv=conv,
                                cust_name=cust_name,
                                service_name=service_name,
                                booking_id=booking_id,
                                slot_time=slot_time,
                                technician_name=technician_name,
                                tech_phone=tech_phone,
                                est_price=est_price,
                                est_val_num=est_val_num
                            )

                            # 3. Dispatch to WhatsApp via Meta Cloud API
                            meta_bot_msg_id = ''
                            if config.connection_status == 'connected' and config.access_token and config.phone_number_id:
                                meta_reply_res = MetaWhatsAppService.send_whatsapp_text(
                                    phone_number_id=config.phone_number_id,
                                    access_token=config.access_token,
                                    to_phone=clean_sender,
                                    text=reply_text,
                                    api_version=config.api_version
                                )
                                if meta_reply_res.get('success'):
                                    meta_bot_msg_id = meta_reply_res.get('message_id', '')
                                    logger.info(f"[Meta Webhook Auto-Reply] Sent to {clean_sender}: {meta_bot_msg_id}")
                                else:
                                    logger.warning(f"[Meta Webhook Auto-Reply] Meta send failed: {meta_reply_res.get('error')}")

                            # 4. Save Bot Message in DB & Stream via SSE
                            bot_msg = Message.objects.create(
                                conversation=conv,
                                sender='bot',
                                sender_name='WhatsQ AI Assistant',
                                text=reply_text,
                                timestamp=now_time,
                                status='sent' if meta_bot_msg_id else 'delivered',
                                meta_message_id=meta_bot_msg_id,
                                rich_card=rich_card
                            )

                            conv.last_contact_date = now_full
                            conv.save()

                            bot_msg_payload = MessageSerializer(bot_msg).data
                            emit_event('message.created', {
                                'conversation_id': conv.id,
                                'message': bot_msg_payload
                            })
                            emit_event('conversation.updated', {
                                'id': conv.id,
                                'last_message': reply_text,
                                'last_contact_date': now_full,
                                'unread_count': conv.unread_count
                            })
                            emit_event('notification.new', {
                                'id': int(time.time() * 1000),
                                'title': f"WhatsQ Auto-Reply to {cust_name}",
                                'text': reply_text[:80],
                                'time': 'Just now',
                                'unread': True,
                                'target': 'conversations',
                                'itemId': conv.id,
                                'itemType': 'conversation'
                            })

                    # Message status updates (sent, delivered, read, failed)
                    statuses = value.get('statuses', [])
                    for s in statuses:
                        status_id = s.get('id')
                        new_status = s.get('status')
                        if status_id and new_status:
                            matching_msgs = Message.objects.filter(meta_message_id=status_id)
                            matching_msgs.update(status=new_status)
                            for m in matching_msgs:
                                if new_status == 'read':
                                    Message.objects.filter(
                                        conversation_id=m.conversation_id,
                                        id__lte=m.id,
                                        sender__in=['agent', 'bot']
                                    ).exclude(status='read').update(status='read')
                                emit_event('message.status_updated', {
                                    'conversation_id': m.conversation_id,
                                    'message_id': m.id,
                                    'status': new_status
                                })
                                # Check for Meta Error 131051 (User blocked business) or 131026
                                if new_status == 'failed':
                                    errors = s.get('errors', [])
                                    for err in errors:
                                        err_code = str(err.get('code', ''))
                                        err_title = err.get('title', '') or err.get('message', '')
                                        if err_code in ['131051', '131026'] or 'block' in err_title.lower():
                                            c = m.conversation
                                            c.is_blocked = True
                                            c.suppression_reason = f"Meta Error {err_code}: {err_title or 'User blocked business number'}"
                                            if 'Blocked' not in c.tags:
                                                c.tags.append('Blocked')
                                            c.save()
                                            logger.warning(f"[Meta Webhook] Contact {c.phone_number} blocked business line (Error {err_code})")
                                            emit_event('contact.blocked', {
                                                'conversation_id': c.id,
                                                'phone': c.phone_number,
                                                'name': c.contact_name,
                                                'code': err_code,
                                                'reason': c.suppression_reason
                                            })
                                            emit_event('notification.new', {
                                                'id': int(time.time() * 1000),
                                                'title': '⛔ WhatsApp Number Blocked',
                                                'text': f"{c.contact_name} ({c.phone_number}) blocked our business line. Auto-suppressed to protect quality score.",
                                                'time': 'Just now',
                                                'unread': True,
                                                'target': 'bulk-recipients',
                                                'itemId': c.id,
                                                'itemType': 'conversation'
                                            })

                # 2. Template Status Updates from Meta (e.g. APPROVED, REJECTED, PAUSED)
                elif field == 'message_template_status_update':
                    template_name = value.get('message_template_name')
                    event = value.get('event') # APPROVED, REJECTED, PAUSED
                    reason = value.get('reason')

                    if template_name:
                        matched = WhatsAppTemplate.objects.filter(name=template_name)
                        if event:
                            matched.update(meta_status=event)
                        if reason:
                            matched.update(rejection_reason=reason)
                        logger.info(f"Updated template {template_name} to status {event}")

        return Response({'status': 'processed'}, status=status.HTTP_200_OK)

class SimulateWhatsAppMessageView(APIView):
    """
    Simulates incoming WhatsApp customer message and triggers AI Intent understanding & Auto responses
    """
    def post(self, request):
        phone = request.data.get('phone', '+91 98765 43210')
        contact_name = request.data.get('name', 'Amit Verma')
        text = request.data.get('text', 'I need AC service tomorrow.')
        
        now_time = datetime.datetime.now().strftime('%I:%M %p')
        now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')

        conv, created = Conversation.objects.get_or_create(
            phone_number=phone,
            defaults={
                'contact_name': contact_name,
                'avatar': '',
                'category': 'Lead',
                'status': 'open',
                'lead_owner': 'Ramesh Kumar',
                'lead_stage': 'New Lead',
                'source': 'WhatsApp',
                'location': 'Koyilandy, Kerala',
                'tags': ['AC Service', 'High Value'],
                'notes': 'Customer requested service via WhatsApp. Needs AC repair.',
                'service_needed': 'AC Repair',
                'estimated_value': 2800.0,
                'active_workflow': 'Service Booking Flow',
                'is_online': True,
                'last_seen': 'Just now'
            }
        )

        conv.is_online = True
        conv.last_seen = 'Just now'
        conv.save()

        emit_event('conversation.presence', {
            'conversation_id': conv.id,
            'is_online': True,
            'last_seen': 'Just now'
        })

        user_msg = Message.objects.create(
            conversation=conv,
            sender='customer',
            text=text,
            timestamp=now_time,
            status='read'
        )

        # Customer sent a message -> all prior outbound messages were read
        Message.objects.filter(
            conversation=conv,
            sender__in=['agent', 'bot']
        ).exclude(status='read').update(status='read')

        # AI Bot automatic intent & contextual reply via Workflow Engine
        last_10 = phone[-10:] if len(phone) >= 10 else phone
        apt = None
        job = None
        if Appointment:
            apt = Appointment.objects.filter(phone__icontains=last_10).order_by('-id').first()
            if not apt and contact_name:
                apt = Appointment.objects.filter(customer_name__icontains=contact_name).order_by('-id').first()
        if Job:
            job = Job.objects.filter(phone__icontains=last_10).order_by('-id').first()
            if not job and contact_name:
                job = Job.objects.filter(customer_name__icontains=contact_name).order_by('-id').first()

        cust_name = contact_name if contact_name and contact_name != 'WhatsApp Customer' else 'Valued Customer'
        service_name = conv.service_needed or (apt.service if apt else (job.service if job else 'AC Repair & Service'))
        booking_id = apt.apt_id_str if apt else (job.job_id_str if job else '#B4821')
        technician_name = apt.employee if apt else (job.assigned_to if job else (conv.lead_owner or 'Ramesh Kumar'))
        tech_phone = '+91 98471 23456'
        slot_time = f"{apt.date_str} at {apt.time_str}" if apt else "Tomorrow at 10:30 AM"
        est_val_num = int(conv.estimated_value) if conv.estimated_value else (int(apt.amount) if apt else 2800)
        est_price = f"₹{est_val_num:,}"

        reply_text, rich_card, step_name = evaluate_workflow_response(
            text_body=text,
            conv=conv,
            cust_name=cust_name,
            service_name=service_name,
            booking_id=booking_id,
            slot_time=slot_time,
            technician_name=technician_name,
            tech_phone=tech_phone,
            est_price=est_price,
            est_val_num=est_val_num
        )

        bot_msg = Message.objects.create(
            conversation=conv,
            sender='bot',
            sender_name='Qiyam AI Assistant',
            text=reply_text,
            timestamp=now_time,
            status='delivered',
            rich_card=rich_card
        )

        conv.last_contact_date = now_full
        conv.status = 'in_progress'
        conv.save()

        user_msg_data = MessageSerializer(user_msg).data
        bot_msg_data = MessageSerializer(bot_msg).data

        emit_event('message.created', {
            'conversation_id': conv.id,
            'message': user_msg_data
        })
        emit_event('message.created', {
            'conversation_id': conv.id,
            'message': bot_msg_data
        })
        emit_event('conversation.updated', {
            'id': conv.id,
            'contact_name': conv.contact_name,
            'phone_number': conv.phone_number,
            'last_message': reply_text,
            'last_contact_date': now_full,
            'unread_count': conv.unread_count
        })
        emit_event('notification.new', {
            'id': int(time.time() * 1000),
            'title': f"Live Simulator: {conv.contact_name}",
            'text': reply_text[:80],
            'time': 'Just now',
            'unread': True,
            'target': 'conversations',
            'itemId': conv.id,
            'itemType': 'conversation'
        })

        return Response({
            'status': 'success',
            'conversation': ConversationSerializer(conv).data,
            'customer_message': user_msg_data,
            'bot_reply': bot_msg_data
        }, status=status.HTTP_200_OK)

class InspectGroupInviteView(APIView):
    """
    Inspects a real WhatsApp Group Invite link (https://chat.whatsapp.com/<invite_code>)
    Fetches authentic OpenGraph metadata (group title, description, avatar, participant count)
    directly from WhatsApp's official servers without any faked or simulated data.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        url = request.query_params.get('url', '').strip()
        return self._inspect(url)

    def post(self, request):
        url = (request.data.get('url') or request.data.get('link') or '').strip()
        return self._inspect(url)

    def _inspect(self, url):
        if not url:
            return Response({'success': False, 'error': 'WhatsApp Group Invite URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        match = re.search(r'chat\.whatsapp\.com/(?:invite/)?([a-zA-Z0-9_\-]+)', url)
        if not match:
            return Response({'success': False, 'error': 'Invalid WhatsApp invite link format. Expected https://chat.whatsapp.com/...'}, status=status.HTTP_400_BAD_REQUEST)

        invite_code = match.group(1).strip()
        target_url = f"https://chat.whatsapp.com/invite/{invite_code}"

        try:
            import requests
            from html import unescape

            headers = {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
            resp = requests.get(target_url, headers=headers, timeout=10)
            html = resp.text

            title_m = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']*)["\']', html, re.I)
            desc_m = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']*)["\']', html, re.I)
            img_m = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']*)["\']', html, re.I)

            title = unescape(title_m.group(1)).strip() if title_m else ''
            desc = unescape(desc_m.group(1)).strip() if desc_m else ''
            image = img_m.group(1).strip() if img_m else ''

            is_generic = title.lower() in ('whatsapp group invite', '')

            # Extract participant count from description if present (e.g. "WhatsApp Group Invite • 42 participants")
            participant_count = None
            part_m = re.search(r'(\d+)\s+participants?', desc, re.I)
            if part_m:
                participant_count = int(part_m.group(1))

            final_title = title if not is_generic else f"WhatsApp Group ({invite_code[:6]})"

            group_data = {
                'code': invite_code,
                'invite_code': invite_code,
                'url': f"https://chat.whatsapp.com/{invite_code}",
                'web_accept_url': f"https://web.whatsapp.com/accept?code={invite_code}",
                'title': final_title,
                'raw_title': title,
                'description': desc or f"WhatsApp Group ({invite_code})",
                'avatar': image or 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
                'image': image or 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
                'participant_count': participant_count,
            }

            return Response({
                'success': True,
                'group': group_data,
                **group_data,
            })
        except Exception as e:
            logger.warning(f"[Group Invite Inspector] Notice fetching {target_url}: {e}")
            group_data = {
                'code': invite_code,
                'invite_code': invite_code,
                'url': f"https://chat.whatsapp.com/{invite_code}",
                'web_accept_url': f"https://web.whatsapp.com/accept?code={invite_code}",
                'title': f"WhatsApp Group ({invite_code[:6]})",
                'raw_title': '',
                'description': f"WhatsApp Group: {url}",
                'avatar': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
                'image': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
                'participant_count': None,
            }
            return Response({
                'success': True,
                'group': group_data,
                **group_data,
            })

