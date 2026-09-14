from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from .models import Conversation, Message, WhatsAppTemplate, MetaWhatsAppConfig
from .meta_service import MetaWhatsAppService
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

# --- ViewSets ---

class MetaConfigViewSet(viewsets.ViewSet):
    """
    Manages Meta WhatsApp Cloud API credentials and connectivity testing
    """
    def list(self, request):
        config = MetaWhatsAppConfig.objects.first()
        if not config:
            config = MetaWhatsAppConfig.objects.create()
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
    queryset = Conversation.objects.all().order_by('-updated_at')
    serializer_class = ConversationSerializer

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        text = request.data.get('text', '')
        rich_card = request.data.get('rich_card', None)
        sender = request.data.get('sender', 'agent')
        sender_name = request.data.get('sender_name', 'Rahul Mehta')

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
    def send_template(self, request, pk=None):
        conversation = self.get_object()
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
        emit_event('conversation.updated', {
            'id': conversation.id,
            'unread_count': 0
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

            # Find matching local template or create
            tmpl, created = WhatsAppTemplate.objects.get_or_create(
                name=name,
                defaults={
                    'category': 'Sales & Marketing' if category == 'MARKETING' else 'Customer Updates',
                    'meta_category': category,
                    'status': 'Active' if status_val == 'APPROVED' else 'Pending',
                    'meta_status': status_val,
                    'language': lang,
                    'body': body_text or 'Synced from Meta',
                    'body_text': body_text or 'Synced from Meta',
                    'header_type': header_type,
                    'header_text': header_text,
                    'footer_text': footer_text,
                    'buttons': buttons,
                    'meta_template_id': m.get('id', '')
                }
            )
            if not created:
                tmpl.meta_status = status_val
                tmpl.meta_template_id = m.get('id', tmpl.meta_template_id)
                if body_text:
                    tmpl.body = body_text
                    tmpl.body_text = body_text
                if header_type != 'NONE':
                    tmpl.header_type = header_type
                    tmpl.header_text = header_text
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
                                for c in Conversation.objects.all():
                                    c_clean = re.sub(r'\D', '', str(c.phone_number))
                                    if c_clean.endswith(last_10):
                                        conv = c
                                        break

                        if not conv:
                            conv = Conversation.objects.create(
                                phone_number=f"+{clean_sender}",
                                contact_name=profile_name,
                                avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                                category='Lead',
                                status='open',
                                lead_owner='Ramesh Kumar',
                                lead_stage='New Lead',
                                source='WhatsApp Cloud API',
                                location='Kozhikode, Kerala',
                                tags=['WhatsApp Inbound'],
                                notes='Initiated contact via Meta WhatsApp Cloud API.',
                                unread_count=1
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

                        conv.unread_count += 1
                        conv.last_contact_date = now_full
                        conv.status = 'open'
                        conv.save()

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
                            'unread_count': conv.unread_count
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
                        if config and config.auto_reply_enabled:
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

                            # 2. Intent Classification & Context Injection
                            lower_text = text_body.strip().lower()
                            reply_text = ''
                            rich_card = None

                            if any(w in lower_text for w in ['reschedule', 're-schedule', 'change date', 'change time', 'postpone']):
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

                            elif any(w in lower_text for w in ['track', 'technician', 'where', 'status', 'arrived', 'reach']):
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

                            elif any(w in lower_text for w in ['call', 'contact', 'number', 'phone']):
                                reply_text = (
                                    f"📞 *Technician Direct Contact*\n\n"
                                    f"Hi {cust_name}, you can reach your technician *{technician_name}* directly at *{tech_phone}*.\n\n"
                                    f"Our Central Operations Helpline is also available at 1800-QIYAM-FIX for any urgent escalations."
                                )

                            elif any(w in lower_text for w in ['price', 'cost', 'rate', 'quote', 'charges', 'quotation', 'amount']):
                                reply_text = (
                                    f"💰 *Service Quotation & Pricing*\n\n"
                                    f"Hi {cust_name}, here is the official estimate for *{service_name}*:\n"
                                    f"• Inspection & Diagnostics: ₹800\n"
                                    f"• Labour & Service: ₹2,000\n"
                                    f"• *Total Estimated Amount: {est_price}*\n\n"
                                    f"To approve and reserve your technician slot, reply *CONFIRM*!"
                                )

                            elif any(w in lower_text for w in ['confirm', 'confirmed', 'yes', 'approve', 'proceed', 'book']):
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

                            else:
                                reply_text = (
                                    f"👋 *Welcome to CoolFix Services, {cust_name}!* \n\n"
                                    f"We received your message regarding *{service_name}* (Booking {booking_id}). How can we assist you today?\n"
                                    f"1️⃣ Reschedule booking\n"
                                    f"2️⃣ Track technician status\n"
                                    f"3️⃣ View quotation & pricing\n"
                                    f"4️⃣ Speak with an agent\n\n"
                                    f"Reply with what you need and our team will assist you immediately!"
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
                                emit_event('message.status_updated', {
                                    'conversation_id': m.conversation_id,
                                    'message_id': m.id,
                                    'status': new_status
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
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
                'active_workflow': 'Service Booking Flow'
            }
        )

        user_msg = Message.objects.create(
            conversation=conv,
            sender='customer',
            text=text,
            timestamp=now_time,
            status='read'
        )

        # AI Bot automatic intent & contextual reply
        bot_reply = None
        rich_card = None
        lower = text.lower()
        if 'ac' in lower or 'service' in lower or 'repair' in lower:
            reply_text = "Sure! I can help you with that. Please share your location so I can check service availability."
            if 'koyilandy' in lower or 'street' in lower or 'park' in lower or 'location' in lower or 'yes' in lower:
                reply_text = "Booking confirmed for tomorrow between 10:00 AM - 12:00 PM. You will receive a reminder. Booking ID: #B4821"
                rich_card = {
                    'type': 'booking',
                    'title': 'Booking Confirmed',
                    'date': 'May 13, 2024 (Mon)',
                    'time': '10:00 AM - 12:00 PM',
                    'service': 'AC Repair',
                    'amount': 2800,
                    'bookingId': '#B4821',
                    'actionText': 'View Details'
                }
            elif 'price' in lower or 'charge' in lower or 'cost' in lower:
                reply_text = "Great! We are available at your location. The charges will be ₹2,800. Shall I book it for you?"
        elif 'quotation' in lower or 'quote' in lower:
            reply_text = "Hello! Our team has prepared your quotation for AC Maintenance. Total estimate is ₹2,800. Would you like us to proceed?"
        else:
            reply_text = f"Hello {contact_name}! Thank you for contacting CoolFix Services. Our team is reviewing your message and will assist you immediately."

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
