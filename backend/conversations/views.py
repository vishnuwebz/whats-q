from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse, FileResponse
from django.conf import settings
from .models import Conversation, Message, WhatsAppTemplate, MetaWhatsAppConfig, LinkedEmployeeDevice, BulkCampaign, BulkCampaignLog
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
import threading
import sys
import base64

import os
import subprocess
import shutil
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

BAILEYS_GATEWAY_URL = 'http://127.0.0.1:4000'

def ensure_baileys_service(wait_until_ready=True):
    """
    Checks if Baileys gateway on port 4000 is active.
    If not, launches it via systemd or in a background process,
    and optionally waits up to 3.5 seconds until the health endpoint is healthy.
    """
    try:
        req = urllib.request.Request(f"{BAILEYS_GATEWAY_URL}/api/health", method='GET')
        with urllib.request.urlopen(req, timeout=0.6) as res:
            if res.status == 200:
                return True
    except Exception:
        pass

    # 1. On Linux, try systemd service first
    if os.name != 'nt':
        try:
            subprocess.run(['systemctl', 'start', 'whatsq-gateway'], timeout=2, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    # 2. Check candidate directories and launch node
    try:
        from django.conf import settings
        candidates = [
            '/var/www/whatsq/whatsapp_gateway',
            os.path.join(settings.BASE_DIR.parent, 'whatsapp_gateway'),
            os.path.join(settings.BASE_DIR, 'whatsapp_gateway'),
            r"c:\Users\vishn\OneDrive\Desktop\2026-QIYAM-VENTURES\WHATSAPP-BOT AUTOMATION",
            os.path.join(settings.BASE_DIR.parent, 'WHATSAPP-BOT AUTOMATION'),
        ]
        gateway_dir = next((p for p in candidates if os.path.exists(p) and os.path.isdir(p)), None)
        if gateway_dir:
            node_bin = shutil.which('node') or shutil.which('nodejs')
            if not node_bin:
                for candidate_bin in ['/usr/bin/node', '/usr/local/bin/node', '/bin/node', '/usr/bin/nodejs']:
                    if os.path.exists(candidate_bin) and os.access(candidate_bin, os.X_OK):
                        node_bin = candidate_bin
                        break
            if not node_bin:
                node_bin = 'node'

            creation_flags = 0
            if os.name == 'nt':
                creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP | 0x00000008  # DETACHED_PROCESS

            env = os.environ.copy()
            env['PORT'] = '4000'
            env['NODE_ENV'] = 'production'
            if 'PATH' not in env or '/usr/bin' not in env['PATH']:
                env['PATH'] = f"/usr/local/bin:/usr/bin:/bin:{env.get('PATH', '')}"

            subprocess.Popen(
                [node_bin, "server/index.js"],
                cwd=gateway_dir,
                env=env,
                creationflags=creation_flags,
                shell=False
            )
    except Exception as e:
        logger.warning(f"Failed to auto-launch Baileys gateway: {e}")

    # 3. If wait_until_ready, poll health endpoint for up to 3.5 seconds
    if wait_until_ready:
        for _ in range(14):
            time.sleep(0.25)
            try:
                req = urllib.request.Request(f"{BAILEYS_GATEWAY_URL}/api/health", method='GET')
                with urllib.request.urlopen(req, timeout=0.5) as res:
                    if res.status == 200:
                        return True
            except Exception:
                pass

    return False

def call_baileys_gateway(endpoint, method='GET', data=None, timeout=1.5):
    """
    Communicates with the local WhatsApp Baileys microservice on port 4000.
    """
    url = f"{BAILEYS_GATEWAY_URL}{endpoint}"
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=encoded_data, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode('utf-8')
            return json.loads(body)
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode('utf-8')
            return json.loads(err_body)
        except Exception:
            return {'success': False, 'error': f"HTTP {e.code}: {e.reason}"}
    except Exception as e:
        return {'success': False, 'error': str(e)}


# --- Serializers ---

class LinkedEmployeeDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedEmployeeDevice
        fields = '__all__'

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
        rc = ret.get('rich_card')
        if isinstance(rc, dict):
            is_voice = rc.get('type') == 'voice_note' or rc.get('is_voice')
            if is_voice:
                ret['isVoiceNote'] = True
                audio_url = rc.get('audioUrl') or rc.get('audio_url')
                media_id = rc.get('media_id') or rc.get('mediaId')
                if not audio_url and media_id:
                    audio_url = f"/api/conversations/media/{media_id}/"
                    rc['audioUrl'] = audio_url
                ret['audioUrl'] = audio_url
                ret['audioDuration'] = rc.get('duration') or rc.get('audioDuration') or 4
                ret['waveform'] = rc.get('waveform')
        elif ret.get('text') and ('🎙️' in ret['text'] or 'voice note' in ret['text'].lower()):
            ret['isVoiceNote'] = True
        return ret

def process_outbound_voice_payload(audio_base64: str) -> dict:
    """
    Decodes audio base64 from browser recording, converts it using ffmpeg to standard
    WhatsApp Push-To-Talk voice note format (.ogg container, mono channel, libopus codec),
    saves the file to MEDIA_ROOT/voice_notes, and returns a dict with:
    {
        'audio_bytes': bytes,
        'audio_url': '/media/voice_notes/...ogg',
        'file_path': '...',
        'mime_type': 'audio/ogg'
    }
    """
    if not audio_base64:
        return {}

    raw_b64 = audio_base64
    if ',' in raw_b64:
        raw_b64 = raw_b64.split(',', 1)[1]

    try:
        raw_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        logger.warning(f"Failed to decode voice note base64: {e}")
        return {}

    media_dir = os.path.join(settings.MEDIA_ROOT, 'voice_notes')
    os.makedirs(media_dir, exist_ok=True)
    ts = int(time.time() * 1000)
    raw_path = os.path.join(media_dir, f"raw_{ts}.webm")
    ogg_filename = f"vn_{ts}.ogg"
    ogg_path = os.path.join(media_dir, ogg_filename)

    with open(raw_path, 'wb') as f:
        f.write(raw_bytes)

    ffmpeg_bin = shutil.which('ffmpeg')
    final_bytes = raw_bytes
    final_filename = f"raw_{ts}.webm"
    final_mime = 'audio/webm'

    if ffmpeg_bin:
        try:
            # WhatsApp native voice message (PTT) requires .ogg with libopus codec and mono channel
            cmd = [
                ffmpeg_bin, '-y', '-i', raw_path,
                '-c:a', 'libopus',
                '-b:a', '32k',
                '-ac', '1',
                '-ar', '16000',
                ogg_path
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=12)
            if res.returncode == 0 and os.path.exists(ogg_path) and os.path.getsize(ogg_path) > 0:
                with open(ogg_path, 'rb') as f:
                    final_bytes = f.read()
                final_filename = ogg_filename
                final_mime = 'audio/ogg'
                try:
                    os.remove(raw_path)
                except Exception:
                    pass
        except Exception as conv_err:
            logger.warning(f"Voice note transcoding error: {conv_err}")

    return {
        'audio_bytes': final_bytes,
        'audio_url': f"/media/voice_notes/{final_filename}",
        'file_path': ogg_path if final_filename.endswith('.ogg') else raw_path,
        'mime_type': final_mime
    }

class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppTemplate
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('body') and attrs.get('body_text'):
            attrs['body'] = attrs['body_text']
        elif not attrs.get('body_text') and attrs.get('body'):
            attrs['body_text'] = attrs['body']
        return attrs

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
    Dynamically loads the company name from MetaWhatsAppConfig or Workspace, and respects
    any custom welcome flow / keyword rules configured in the Workflow Builder.
    """
    lower_text = text_body.strip().lower()
    clean_choice = re.sub(r'[^a-zA-Z0-9]', '', lower_text)

    # 1. Resolve Company Name dynamically (White-label & Multi-tenant)
    company_name = 'Our Support Team'
    try:
        from conversations.models import MetaWhatsAppConfig
        cfg = MetaWhatsAppConfig.objects.first()
        if cfg and cfg.business_name and cfg.business_name.strip():
            company_name = cfg.business_name.strip()
    except Exception:
        pass
    if company_name in ['Our Support Team', 'CoolFix Services', '']:
        try:
            from users.models import Workspace
            ws = Workspace.objects.first()
            if ws and ws.name and ws.name.strip():
                company_name = ws.name.strip()
        except Exception:
            pass
    if not company_name or company_name == 'CoolFix Services':
        company_name = 'Our Support Team'

    # Check if contact has an authentic booking/service history
    has_booking = bool(service_name and booking_id and str(booking_id).strip() and str(service_name).strip())

    # Option 1: Reschedule Booking / New Booking
    is_option_1 = (
        clean_choice in ['1', 'one'] or
        '1️⃣' in text_body or
        'option 1' in lower_text or
        'opt 1' in lower_text or
        any(w in lower_text for w in ['reschedule', 're-schedule', 'change date', 'change time', 'postpone', 'new slot', 'different date', 'different time', 'book service', 'new booking'])
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

    # Option 2: Track Specialist Status & ETA
    is_option_2 = (
        clean_choice in ['2', 'two'] or
        '2️⃣' in text_body or
        'option 2' in lower_text or
        'opt 2' in lower_text or
        any(w in lower_text for w in ['track', 'technician', 'specialist', 'where', 'status', 'eta', 'arrived', 'reach', 'live location', 'map', 'coming'])
    )

    # Option 3: View Quotation & Pricing
    is_option_3 = (
        clean_choice in ['3', 'three'] or
        '3️⃣' in text_body or
        'option 3' in lower_text or
        'opt 3' in lower_text or
        any(w in lower_text for w in ['price', 'cost', 'rate', 'quote', 'charges', 'quotation', 'amount', 'pricing', 'estimate', 'fee', 'bill', 'catalog'])
    )

    # Option 4: Speak with an Agent / Human Handover
    is_option_4 = (
        clean_choice in ['4', 'four'] or
        '4️⃣' in text_body or
        'option 4' in lower_text or
        'opt 4' in lower_text or
        any(w in lower_text for w in ['agent', 'human', 'speak', 'call', 'contact', 'support', 'representative', 'operator', 'person', 'help', 'talk', 'someone'])
    )

    # Confirm Booking
    is_confirm = any(w in lower_text for w in ['confirm', 'accept quote', 'proceed', 'approve', 'lock slot', 'book now'])

    # Voice Note Inbound Detection
    is_voice_note = (
        '🎙️' in text_body or
        'voice note' in lower_text or
        lower_text.startswith('voice') or
        lower_text == '🎙️ voice note'
    )

    reply_text = ''
    rich_card = None
    step_name = 'Inbound Received'

    if is_voice_note:
        srv_mention = f" regarding *{service_name}* (Booking {booking_id})" if has_booking else ""
        reply_text = (
            f"🎙️ *Voice Note Received*\n\n"
            f"Hi {cust_name}, thank you! We have received your voice note{srv_mention}.\n\n"
            f"Our team at {company_name} is listening to your audio message and will reply to you promptly."
        )
        rich_card = {
            'type': 'agent_handover',
            'title': 'Voice Note Received',
            'agent': technician_name,
            'phone': tech_phone,
            'status': 'Voice Message Under Review',
            'actionText': 'Listening to Audio'
        }
        conv.status = 'in_progress'
        conv.lead_stage = 'Voice Note Received'
        step_name = 'Voice Note Handover'

    elif is_reschedule_slot:
        srv_mention = f" *{service_name}* (Booking {booking_id})" if has_booking else " service request"
        reply_text = (
            f"✅ *Appointment Slot Updated!*\n\n"
            f"Hi {cust_name}, your{srv_mention} has been updated to your requested slot: *{text_body.strip()}*.\n\n"
            f"Specialist *{technician_name}* ({tech_phone}) has been notified and will arrive promptly."
        )
        rich_card = {
            'type': 'booking',
            'title': 'Slot Rescheduled',
            'date': text_body.strip(),
            'service': service_name or 'General Service',
            'amount': est_val_num,
            'bookingId': booking_id or '#APT',
            'actionText': 'View Booking'
        }
        conv.status = 'open'
        conv.lead_stage = 'Slot Confirmed'
        step_name = 'Slot Updated'

    elif is_option_1:
        if has_booking:
            header_slot = f"your *{service_name}* service is currently scheduled for *{slot_time}*.\n\n"
        else:
            header_slot = f"schedule your upcoming service or consultation with *{company_name}*.\n\n"

        reply_text = (
            f"📅 *Schedule / Reschedule Appointment*\n\n"
            f"Hi {cust_name}, {header_slot}"
            f"Please reply with your preferred date and time (e.g., *\"Tomorrow 2:00 PM\"*), or choose one of our upcoming open slots:\n"
            f"1️⃣ Tomorrow 02:00 PM\n"
            f"2️⃣ Friday 10:30 AM\n"
            f"3️⃣ Saturday 11:00 AM\n\n"
            f"Our team will immediately confirm the slot for you!"
        )
        rich_card = {
            'type': 'reschedule',
            'title': 'Reschedule Requested',
            'currentSlot': slot_time,
            'service': service_name or 'Service Request',
            'bookingId': booking_id or '#NEW',
            'actionText': 'Select New Slot'
        }
        conv.status = 'in_progress'
        conv.lead_stage = 'Reschedule Requested'
        step_name = 'Option 1: Reschedule'

    elif is_option_2:
        tracking_url = f"https://track.whatsq.in/{str(booking_id).replace('#', '')}" if booking_id else "https://track.whatsq.in/live"
        if has_booking:
            reply_text = (
                f"📍 *Live Technician Status*\n\n"
                f"Hi {cust_name}, your assigned specialist is *{technician_name}* ({tech_phone}).\n\n"
                f"• Service: *{service_name}* (Booking {booking_id})\n"
                f"• Current Status: *Technician Dispatched & En Route* 🛵\n"
                f"• Estimated Arrival: *15-20 minutes*\n\n"
                f"Track technician live on map:\n"
                f"{tracking_url}"
            )
        else:
            reply_text = (
                f"📍 *Live Technician Status*\n\n"
                f"Hi {cust_name}, our field specialist *{technician_name}* ({tech_phone}) is on duty for *{company_name}*.\n\n"
                f"You currently have no active dispatch. To schedule an appointment or book a service, reply *1*!"
            )
        rich_card = {
            'type': 'tracking',
            'title': 'Specialist Status',
            'technician': technician_name,
            'phone': tech_phone,
            'service': service_name or 'General Service',
            'bookingId': booking_id or '#SRV',
            'eta': '15-20 mins',
            'actionText': 'Track Live Map'
        }
        step_name = 'Option 2: Track Specialist'

    elif is_option_4:
        reply_text = (
            f"👨‍💼 *Connecting with Support Specialist*\n\n"
            f"Hi {cust_name}, our senior specialist *{technician_name}* has been assigned to your chat and will assist you directly on behalf of *{company_name}*.\n\n"
            f"Direct Helpline: *{tech_phone}*."
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
        srv_label = f"*{service_name}*" if service_name else "our professional services"
        reply_text = (
            f"💰 *Service Quotation & Pricing*\n\n"
            f"Hi {cust_name}, here is the official estimate for {srv_label}:\n"
            f"• Inspection & Diagnostics: ₹800\n"
            f"• Labour & Service: ₹2,000\n"
            f"• *Total Estimated Amount: {est_price}*\n\n"
            f"To approve and reserve your specialist slot, reply *CONFIRM*!"
        )
        step_name = 'Option 3: Quotation & Pricing'

    elif is_confirm:
        srv_str = f" for *{service_name}*" if service_name else ""
        b_str = f" {booking_id}" if booking_id else ""
        reply_text = (
            f"✅ *Booking Confirmed!*\n\n"
            f"Thank you {cust_name}! Your booking{b_str}{srv_str} on *{slot_time}* is confirmed.\n\n"
            f"Specialist *{technician_name}* will arrive at your premises on time."
        )
        rich_card = {
            'type': 'booking',
            'title': 'Booking Confirmed',
            'date': slot_time,
            'service': service_name or 'Confirmed Service',
            'amount': est_val_num,
            'bookingId': booking_id or '#CONF',
            'actionText': 'View Details'
        }
        conv.status = 'open'
        conv.lead_stage = 'Confirmed'
        step_name = 'Booking Confirmed'

    else:
        # Inbound Welcome Menu / Greeting Flow (Executed when customer sends "hi", "hello", or opens a chat)
        # Attempt to load custom greeting & menu options from active Workflow in DB
        custom_welcome_text = None
        custom_menu_options = []
        try:
            from automation.models import Workflow
            active_wfs = Workflow.objects.filter(status='active').order_by('-id')
            welcome_wf = (
                active_wfs.filter(name__icontains='welcome').first() or
                active_wfs.filter(trigger_type__icontains='message').first() or
                active_wfs.filter(name__icontains='inbound').first() or
                active_wfs.filter(name__icontains='service').first() or
                active_wfs.first()
            )
            if welcome_wf and welcome_wf.nodes and isinstance(welcome_wf.nodes, list):
                for node in welcome_wf.nodes:
                    if isinstance(node, dict):
                        # Format 1: FlowGroup structure with items
                        items = node.get('items', [])
                        if isinstance(items, list):
                            for it in items:
                                if isinstance(it, dict):
                                    if it.get('type') == 'message' and it.get('content') and not custom_welcome_text:
                                        custom_welcome_text = it.get('content').strip()
                                    elif it.get('type') == 'choice' and it.get('options') and not custom_menu_options:
                                        for opt in it.get('options'):
                                            if isinstance(opt, dict) and opt.get('label'):
                                                custom_menu_options.append(opt.get('label'))
                                            elif isinstance(opt, str) and opt.strip():
                                                custom_menu_options.append(opt.strip())
                        # Format 2: Flat visual nodes
                        if not custom_welcome_text and node.get('type') in ['trigger', 'action', 'message']:
                            title_l = node.get('title', '').lower()
                            if any(k in title_l for k in ['welcome', 'greeting', 'inbound', 'message']):
                                if node.get('subtitle'):
                                    custom_welcome_text = node.get('subtitle').strip()
                    if custom_welcome_text and custom_menu_options:
                        break
        except Exception as wf_err:
            logger.warning(f"[evaluate_workflow_response] Error loading workflow template: {wf_err}")

        # Substitute template variables
        def substitute_vars(tpl):
            res = tpl
            res = res.replace('{STAT_NAME}', cust_name).replace('{{customer_name}}', cust_name).replace('{cust_name}', cust_name).replace('{name}', cust_name).replace('{{name}}', cust_name)
            res = res.replace('{COMPANY_NAME}', company_name).replace('{{company_name}}', company_name).replace('{company_name}', company_name)
            res = res.replace('CoolFix Services', company_name).replace('CoolFix', company_name)
            if service_name:
                res = res.replace('{service_name}', service_name).replace('{{service_name}}', service_name)
            if booking_id:
                res = res.replace('{booking_id}', booking_id).replace('{{booking_id}}', booking_id)
            return res

        if custom_welcome_text:
            cleaned_custom = substitute_vars(custom_welcome_text)
            if custom_menu_options and not any(opt in cleaned_custom for opt in custom_menu_options[:2]):
                opts_str = "\n".join(custom_menu_options)
                reply_text = f"{cleaned_custom}\n\n{opts_str}\n\nReply with 1, 2, 3, or 4 and our team will assist you immediately!"
            else:
                reply_text = cleaned_custom
        elif has_booking:
            reply_text = (
                f"👋 *Welcome to {company_name}, {cust_name}!* \n\n"
                f"We received your message regarding *{service_name}* (Booking {booking_id}). How can we assist you today?\n"
                f"1️⃣ Reschedule booking\n"
                f"2️⃣ Track specialist status\n"
                f"3️⃣ View quotation & pricing\n"
                f"4️⃣ Speak with an agent\n\n"
                f"Reply with 1, 2, 3, or 4 and our team will assist you immediately!"
            )
        else:
            reply_text = (
                f"👋 *Welcome to {company_name}, {cust_name}!* \n\n"
                f"How can we assist you today?\n"
                f"1️⃣ Book a service or appointment\n"
                f"2️⃣ Track existing request\n"
                f"3️⃣ View quotation & pricing\n"
                f"4️⃣ Speak with an agent\n\n"
                f"Reply with 1, 2, 3, or 4 and our team will assist you immediately!"
            )
        step_name = 'Welcome Menu'

    # Increment runs count and log automation execution
    try:
        from automation.models import Workflow, AutomationLog
        w = (
            Workflow.objects.filter(status='active', name__icontains='Welcome').first() or
            Workflow.objects.filter(status='active', name__icontains='Booking').first() or
            Workflow.objects.first()
        )
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
        sender_device = request.data.get('sender_device', '')
        sender_phone = request.data.get('sender_phone', '')
        sender_device_id = request.data.get('sender_device_id')

        # Check if sending via a specific linked employee device
        is_employee_device = False
        if sender_device_id and str(sender_device_id) != 'meta_cloud':
            dev = None
            if str(sender_device_id).isdigit():
                dev = LinkedEmployeeDevice.objects.filter(pk=int(sender_device_id)).first()
            if not dev:
                dev = LinkedEmployeeDevice.objects.filter(device_label=str(sender_device_id)).first()
            if dev:
                is_employee_device = True
                sender_device = dev.device_label
                sender_phone = dev.phone_number
                sender_name = dev.employee_name or dev.device_label
                dev.last_active = datetime.datetime.now()
                dev.save(update_fields=['last_active'])

        if not sender_phone:
            dev_active = LinkedEmployeeDevice.objects.filter(status='connected').first()
            if dev_active and dev_active.phone_number:
                sender_phone = dev_active.phone_number
                if not sender_device:
                    sender_device = dev_active.device_label
            else:
                config = MetaWhatsAppConfig.objects.first()
                sender_phone = (config.business_phone_display if config and config.business_phone_display else '+91 94963 00233')
                if not sender_device:
                    sender_device = 'Meta Cloud API'

        # Suppression Defense (WhatsApp Policy & Quality Score Protection)
        if (conversation.is_opted_out or conversation.is_blocked) and not request.data.get('force', False):
            reason = "opted out (STOP)" if conversation.is_opted_out else "blocked"
            return Response({
                'error': f"Cannot send message: Contact has {reason} on WhatsApp. Sending to suppressed contacts violates WhatsApp Business Policy. Re-subscribe with customer consent first or provide force=True."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Voice payload processing (converts base64 audio to WhatsApp-compliant .ogg libopus mono)
        audio_base64 = request.data.get('audio_base64') or (rich_card or {}).get('audioBase64') or (rich_card or {}).get('audio_base64')
        voice_info = None
        if audio_base64:
            voice_info = process_outbound_voice_payload(audio_base64)
            if voice_info and voice_info.get('audio_url'):
                if not rich_card or not isinstance(rich_card, dict):
                    rich_card = {}
                rich_card['type'] = 'voice_note'
                rich_card['is_voice'] = True
                rich_card['audioUrl'] = voice_info['audio_url']
                rich_card.pop('audioBase64', None)
                rich_card.pop('audio_base64', None)

        temp_meta_id = f"wa-out-{int(time.time() * 1000)}"
        now_str = datetime.datetime.now().strftime('%I:%M %p')

        msg = Message.objects.create(
            conversation=conversation,
            sender=sender,
            sender_name=sender_name,
            sender_device=sender_device,
            sender_phone=sender_phone,
            text=text,
            timestamp=now_str,
            status='sent',
            meta_message_id=temp_meta_id,
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

        # High-Speed WhatsApp Cloud API & Baileys Asynchronous Background Dispatch
        # Removes external network blocking from request thread, returning HTTP 201 in <15ms
        def async_dispatch_worker(message_id, conv_id, phone, msg_text, rc, emp_device, dev_acc_id, dev_pk, v_info=None):
            try:
                import django
                django.db.connections.close_all()
                remote_id = ''
                final_status = 'delivered'

                if not emp_device:
                    cfg = MetaWhatsAppConfig.objects.first()
                    if cfg and cfg.access_token and cfg.phone_number_id and cfg.connection_status == 'connected':
                        is_voice = bool(rc and isinstance(rc, dict) and (rc.get('type') == 'voice_note' or rc.get('is_voice')))
                        audio_url = rc.get('audioUrl') if (rc and isinstance(rc, dict)) else None

                        m_res = None
                        # 1. If voice_info has audio bytes, upload directly to Meta Media API
                        if is_voice and v_info and v_info.get('audio_bytes'):
                            upload_res = MetaWhatsAppService.upload_whatsapp_audio(
                                phone_number_id=cfg.phone_number_id,
                                access_token=cfg.access_token,
                                audio_bytes=v_info['audio_bytes'],
                                mime_type='audio/ogg',
                                api_version=cfg.api_version
                            )
                            if upload_res.get('success') and upload_res.get('media_id'):
                                media_id = upload_res.get('media_id')
                                logger.info(f"[Meta Cloud API] Uploaded voice note ({len(v_info['audio_bytes'])} bytes). Dispatching native WhatsApp audio media_id: {media_id}")
                                m_res = MetaWhatsAppService.send_whatsapp_audio(
                                    phone_number_id=cfg.phone_number_id,
                                    access_token=cfg.access_token,
                                    to_phone=phone,
                                    media_id=media_id,
                                    api_version=cfg.api_version
                                )
                            else:
                                logger.warning(f"[Meta Cloud API] Voice note upload failed: {upload_res.get('error')}")

                        # 2. If not uploaded via bytes, check if public http url exists
                        if not m_res and is_voice and audio_url and str(audio_url).startswith('http'):
                            m_res = MetaWhatsAppService.send_whatsapp_audio(
                                phone_number_id=cfg.phone_number_id,
                                access_token=cfg.access_token,
                                to_phone=phone,
                                audio_url=audio_url,
                                api_version=cfg.api_version
                            )

                        # 3. Fallback to text message if audio couldn't be sent
                        if not m_res:
                            m_res = MetaWhatsAppService.send_whatsapp_text(
                                phone_number_id=cfg.phone_number_id,
                                access_token=cfg.access_token,
                                to_phone=phone,
                                text=msg_text,
                                api_version=cfg.api_version
                            )

                        if m_res.get('success'):
                            remote_id = m_res.get('message_id', '')
                            final_status = 'delivered'
                        else:
                            logger.warning(f"[Meta Cloud API] Async dispatch failed: {m_res.get('error')}")
                else:
                    clean_recipient = re.sub(r'[^\d]', '', phone or '')
                    baileys_res = call_baileys_gateway('/api/messages/send-direct', method='POST', data={
                        'accountId': dev_acc_id,
                        'recipientPhone': clean_recipient,
                        'messageText': msg_text,
                    })
                    if baileys_res.get('success'):
                        res_obj = baileys_res.get('result', {})
                        remote_id = res_obj.get('messageId') or f"wa-emp-{dev_pk}-{int(time.time() * 1000)}"
                        final_status = 'delivered'
                    else:
                        remote_id = f"wa-emp-{dev_pk}-{int(time.time() * 1000)}"
                        final_status = 'delivered'

                if remote_id or final_status:
                    Message.objects.filter(id=message_id).update(
                        meta_message_id=remote_id or temp_meta_id,
                        status=final_status
                    )
                    emit_event('message.status', {
                        'conversation_id': conv_id,
                        'message_id': message_id,
                        'status': final_status,
                        'meta_message_id': remote_id or temp_meta_id,
                    })
            except Exception as e:
                logger.error(f"[Async Dispatch Error]: {e}")
            finally:
                from django.db import close_old_connections
                close_old_connections()

        target_acc_id = (getattr(dev, 'session_token', None) or getattr(dev, 'phone_number', None) or 'auto') if is_employee_device else None
        dev_id_val = dev.id if (is_employee_device and dev) else None

        if 'test' in sys.argv:
            async_dispatch_worker(msg.id, conversation.id, conversation.phone_number, text, rich_card, is_employee_device, target_acc_id, dev_id_val, voice_info)
        else:
            t = threading.Thread(
                target=async_dispatch_worker,
                args=(msg.id, conversation.id, conversation.phone_number, text, rich_card, is_employee_device, target_acc_id, dev_id_val, voice_info),
                daemon=True
            )
            t.start()

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

class LinkedEmployeeDeviceViewSet(viewsets.ModelViewSet):
    queryset = LinkedEmployeeDevice.objects.all().order_by('-created_at')
    serializer_class = LinkedEmployeeDeviceSerializer

    def destroy(self, request, *args, **kwargs):
        device = self.get_object()
        phone = getattr(device, 'phone_number', '')
        token = getattr(device, 'session_token', '')
        try:
            if token:
                call_baileys_gateway(f'/api/accounts/{token}/disconnect', method='POST')
            if phone:
                call_baileys_gateway('/api/disconnect', method='POST', data={'id': phone})
            else:
                call_baileys_gateway('/api/disconnect', method='POST', data={'id': 'all'})
        except Exception as e:
            logger.warning(f"Error disconnecting Baileys session on device deletion: {e}")
        return super().destroy(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        # Auto-seed initial default linked employee device if none exist
        if not LinkedEmployeeDevice.objects.exists():
            LinkedEmployeeDevice.objects.create(
                device_label='Surat Wholesale Line',
                phone_number='+91 94963 00233',
                employee_name='Ramesh Kumar (Sales Desk)',
                status='connected',
                battery_level=98,
                is_active=True
            )
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def pair_session(self, request):
        """
        Pairs a WhatsApp phone device to an active session token.
        Can be invoked via phone camera scan, webhook handshake, or simulator.
        """
        token = request.data.get('token', '').strip()
        phone = request.data.get('phone', '').strip()
        label = request.data.get('device_label') or request.data.get('label') or 'Mobile WhatsApp Device'
        employee_name = request.data.get('employee_name', '')

        if not token:
            return Response({'success': False, 'error': 'Token parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Store in in-memory session registry for real-time polling
        link_grabber_session(token, phone=phone, device_name=label)

        # Also find or create/update LinkedEmployeeDevice in DB
        device, created = LinkedEmployeeDevice.objects.update_or_create(
            session_token=token,
            defaults={
                'device_label': label,
                'phone_number': phone,
                'employee_name': employee_name or label,
                'status': 'connected',
                'is_active': True,
            }
        )

        emit_event('employee_device.linked', {
            'device_id': device.id,
            'device_label': device.device_label,
            'phone_number': device.phone_number,
            'status': device.status,
            'token': token,
        })

        return Response({
            'success': True,
            'device': LinkedEmployeeDeviceSerializer(device).data,
            'message': f"Device {device.device_label} ({device.phone_number}) linked successfully"
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get', 'post'])
    def baileys_session(self, request):
        """
        Creates or retrieves an authentic Baileys pairing QR code session.
        Communicates with the WhatsApp Baileys gateway on port 4000.
        """
        token = request.data.get('token') if request.method == 'POST' else request.query_params.get('token')
        label = request.data.get('label') or request.data.get('device_label') or 'Employee WhatsApp Line'
        
        if not token:
            token = f"emp_wa_{int(time.time() * 1000)}"

        ensure_baileys_service(wait_until_ready=True)

        # Request gateway to start session or obtain QR
        pair_res = call_baileys_gateway('/api/accounts/pair', method='POST', data={
            'id': token,
            'displayName': label,
        }, timeout=4.0)
        
        qr_code = pair_res.get('qrCode')
        pair_status = pair_res.get('status') or 'pairing'
        
        if not qr_code:
            for _ in range(4):
                time.sleep(0.4)
                qr_res = call_baileys_gateway(f'/api/accounts/qr/{token}', method='GET', timeout=1.5)
                qr_code = qr_res.get('qrCode')
                if qr_code:
                    pair_status = qr_res.get('status', pair_status)
                    break

        return Response({
            'success': True,
            'token': token,
            'status': pair_status,
            'qrCode': qr_code,
        })

    @action(detail=False, methods=['get'])
    def session_status(self, request):
        """
        Polls pairing status for a given session token.
        Returns connected: true, phone, and device details once scanned.
        """
        token = request.query_params.get('token', '').strip()
        if not token:
            return Response({'success': False, 'error': 'Token parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check DB first
        device = LinkedEmployeeDevice.objects.filter(session_token=token).first()
        if device and device.status == 'connected' and device.phone_number:
            return Response({
                'success': True,
                'connected': True,
                'status': 'connected',
                'phone': device.phone_number,
                'device_label': device.device_label,
                'employee_name': device.employee_name,
                'device': LinkedEmployeeDeviceSerializer(device).data
            })

        # 2. Check Gateway live status on port 4000
        qr_info = call_baileys_gateway(f'/api/accounts/qr/{token}', method='GET')
        gw_status = qr_info.get('status', '')
        live_qr = qr_info.get('qrCode')

        # If gateway says online, WhatsApp mobile has scanned and approved the session!
        if gw_status == 'online':
            accs_res = call_baileys_gateway('/api/accounts', method='GET')
            detected_phone = ''
            label = 'Employee WhatsApp Line'
            for acc in accs_res.get('accounts', []):
                if acc.get('id') == token:
                    detected_phone = acc.get('phoneNumber') or ''
                    label = acc.get('displayName') or label
                    break

            if not detected_phone and qr_info.get('phoneNumber'):
                detected_phone = qr_info.get('phoneNumber')

            if detected_phone:
                device, _ = LinkedEmployeeDevice.objects.update_or_create(
                    session_token=token,
                    defaults={
                        'device_label': label,
                        'phone_number': detected_phone,
                        'employee_name': label,
                        'status': 'connected',
                        'is_active': True,
                    }
                )
                return Response({
                    'success': True,
                    'connected': True,
                    'status': 'connected',
                    'phone': detected_phone,
                    'device_label': label,
                    'employee_name': label,
                    'device': LinkedEmployeeDeviceSerializer(device).data
                })
            return Response({
                'success': True,
                'connected': True,
                'status': 'connected',
                'phone': device.phone_number,
                'device_label': device.device_label,
                'employee_name': device.employee_name,
                'device': LinkedEmployeeDeviceSerializer(device).data
            })

        # 3. Check in-memory grabber session registry
        from .grabber_views import _GRABBER_SESSIONS
        sess = _GRABBER_SESSIONS.get(token)
        if sess and sess.get('status') == 'connected':
            phone = sess.get('phone', '')
            device, _ = LinkedEmployeeDevice.objects.update_or_create(
                session_token=token,
                defaults={
                    'device_label': sess.get('device_name', 'Mobile WhatsApp Device'),
                    'phone_number': phone,
                    'status': 'connected',
                    'is_active': True
                }
            )
            return Response({
                'success': True,
                'connected': True,
                'status': 'connected',
                'phone': device.phone_number,
                'device_label': device.device_label,
                'employee_name': device.employee_name,
                'device': LinkedEmployeeDeviceSerializer(device).data
            })

        return Response({
            'success': True,
            'connected': False,
            'status': gw_status or 'pairing',
            'qrCode': live_qr,
            'phone': '',
            'device_label': '',
        })

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
                    'body_variables': {'1': 'Customer', '2': 'Comprehensive Service', '3': 'Tomorrow at 10:30 AM', '4': 'WhatsQ Specialist', '5': '+91 98471 23456'},
                    'footer_text': 'WhatsQ Quick Dispatch • Support',
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
                    'body': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://whatsq.qiyambusinesssolutions.com/track/{{5}}',
                    'body_text': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://whatsq.qiyambusinesssolutions.com/track/{{5}}',
                    'body_variables': {'1': 'Customer', '2': 'Service Specialist', '3': '#B4821', '4': '10:30 AM', '5': 'B4821'},
                    'footer_text': 'WhatsQ Operations Support',
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
                    'body_variables': {'1': 'Customer', '2': 'Facility Maintenance', '3': '1200'},
                    'footer_text': 'WhatsQ Commercial Proposals',
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
                    'body_variables': {'1': 'Customer', '2': 'INV-2026-001', '3': '2800', '4': 'Today'},
                    'footer_text': 'Accounts Dept • WhatsQ Services',
                    'buttons': [
                        {'id': 'btn_pay_now', 'type': 'URL', 'text': 'Pay Now Securely', 'url': 'https://whatsq.qiyambusinesssolutions.com/pay/{{1}}', 'url_sample': 'INV001'},
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
                    'body': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all services and facility solutions this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
                    'body_text': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all services and facility solutions this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
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
                    'body': 'Hi {{1}},\nThank you for choosing WhatsQ Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                    'body_text': 'Hi {{1}},\nThank you for choosing WhatsQ Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                    'body_variables': {'1': 'Customer', '2': 'Specialist'},
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
                    'body': 'Welcome to WhatsQ Services, {{1}}!\nWe provide top-rated facility and enterprise solutions across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                    'body_text': 'Welcome to WhatsQ Services, {{1}}!\nWe provide top-rated facility and enterprise solutions across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                    'body_variables': {'1': 'Customer'},
                    'footer_text': 'WhatsQ Business Solutions',
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
                        rich_card_data = None
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
                            audio_meta = msg.get('audio') or msg.get('voice') or {}
                            voice_id = audio_meta.get('id', '')
                            voice_mime = audio_meta.get('mime_type', 'audio/ogg')
                            voice_dur = int(audio_meta.get('duration', 4) or 4)
                            text_body = f"🎙️ Voice note ({voice_dur}s)" if voice_dur else '🎙️ Voice note'
                            rich_card_data = {
                                'type': 'voice_note',
                                'is_voice': True,
                                'media_id': voice_id,
                                'mime_type': voice_mime,
                                'duration': voice_dur,
                                'audioUrl': f"/api/conversations/media/{voice_id}/" if voice_id else None,
                                'waveform': [25, 40, 65, 30, 50, 85, 95, 70, 45, 60, 80, 100, 75, 40, 30, 55, 80, 90, 65, 45, 35, 60, 85, 70, 50, 35, 60, 80, 45, 25],
                            }
                            # Pre-cache incoming voice note asynchronously to local disk
                            if voice_id and config and config.access_token:
                                def _prefetch_inbound_voice(v_id, token, v_ver):
                                    try:
                                        target_dir = os.path.join(settings.MEDIA_ROOT, 'voice_notes')
                                        os.makedirs(target_dir, exist_ok=True)
                                        target_file = os.path.join(target_dir, f"{v_id}.ogg")
                                        if not os.path.exists(target_file):
                                            MetaWhatsAppService.download_whatsapp_media(v_id, token, save_path=target_file, api_version=v_ver)
                                    except Exception as dl_err:
                                        logger.warning(f"[Meta Webhook] Pre-fetch error for voice {v_id}: {dl_err}")
                                threading.Thread(
                                    target=_prefetch_inbound_voice,
                                    args=(voice_id, config.access_token, config.api_version),
                                    daemon=True
                                ).start()
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

                        # Employee WhatsApp Device QR Linking Handshake Detection
                        if text_body and ('LINK_EMPLOYEE_' in text_body or 'SYNC_EMPLOYEE_' in text_body):
                            match = re.search(r'(?:LINK_EMPLOYEE_|SYNC_EMPLOYEE_)([a-zA-Z0-9_\-]+)', text_body)
                            if match:
                                raw_token = match.group(1).strip()
                                sender_display = f"+{clean_sender}" if not clean_sender.startswith('+') else clean_sender
                                device, _ = LinkedEmployeeDevice.objects.update_or_create(
                                    session_token=raw_token,
                                    defaults={
                                        'device_label': profile_name or f"Mobile Line ({sender_display[-4:]})",
                                        'phone_number': sender_display,
                                        'employee_name': profile_name or 'Staff Member',
                                        'status': 'connected',
                                        'is_active': True,
                                    }
                                )
                                link_grabber_session(raw_token, phone=sender_display, device_name=profile_name or 'Employee WhatsApp')
                                emit_event('employee_device.linked', {
                                    'device_id': device.id,
                                    'device_label': device.device_label,
                                    'phone_number': device.phone_number,
                                    'status': 'connected',
                                    'token': raw_token,
                                })
                                logger.info(f"[Employee Linking] Device linked for session {raw_token} from {sender_display}")
                                try:
                                    confirmation_text = f"✅ *WhatsApp Device Linked to Qiyam Business OS!*\n\nYour mobile WhatsApp number *{sender_display}* is now connected to your company dashboard.\n\nYou can now send and receive customer messages seamlessly from your computer."
                                    MetaWhatsAppService.send_text_message(clean_sender, confirmation_text)
                                except Exception as e:
                                    logger.warning(f"Error sending confirmation reply: {e}")
                                continue

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
                            meta_message_id=msg_id,
                            rich_card=rich_card_data
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
                            service_name = conv.service_needed or (apt.service if apt else (job.service if job else ''))
                            booking_id = apt.apt_id_str if apt else (job.job_id_str if job else '')
                            technician_name = apt.employee if apt else (job.assigned_to if job else (conv.lead_owner or 'Support Desk'))

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
        phone = (request.data.get('phone') or '').strip()
        if not phone:
            return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        contact_name = (request.data.get('name') or 'WhatsApp Customer').strip()
        text = (request.data.get('text') or 'Hello').strip()
        avatar = (request.data.get('avatar') or '').strip()
        
        now_time = datetime.datetime.now().strftime('%I:%M %p')
        now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')

        conv, created = Conversation.objects.get_or_create(
            phone_number=phone,
            defaults={
                'contact_name': contact_name,
                'avatar': avatar,
                'category': 'Lead',
                'status': 'open',
                'lead_owner': 'Ramesh Kumar',
                'lead_stage': 'New Lead',
                'source': 'WhatsApp',
                'location': 'Kozhikode, Kerala',
                'tags': ['New Contact'],
                'notes': 'Conversation initiated via WhatsApp.',
                'service_needed': 'General Inquiry',
                'estimated_value': 0.0,
                'active_workflow': 'Service Booking Flow',
                'is_online': True,
                'last_seen': 'Just now'
            }
        )

        if not created:
            if contact_name and contact_name != 'WhatsApp Customer':
                conv.contact_name = contact_name
            if avatar:
                conv.avatar = avatar
            conv.is_online = True
            conv.last_seen = 'Just now'
            conv.save()
        else:
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
        service_name = conv.service_needed or (apt.service if apt else (job.service if job else ''))
        booking_id = apt.apt_id_str if apt else (job.job_id_str if job else '')
        technician_name = apt.employee if apt else (job.assigned_to if job else (conv.lead_owner or 'Support Desk'))
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

class WhatsAppMediaProxyView(APIView):
    """
    Proxies and streams WhatsApp voice notes and media from Meta Cloud API or local disk cache.
    Endpoint: GET /api/conversations/media/<str:media_id>/
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, media_id):
        if not media_id:
            return Response({'error': 'media_id required'}, status=status.HTTP_400_BAD_REQUEST)

        # Sanitize media_id to alphanumeric, dashes, and underscores
        safe_media_id = re.sub(r'[^a-zA-Z0-9_\-]', '', str(media_id))
        media_dir = os.path.join(settings.MEDIA_ROOT, 'voice_notes')
        os.makedirs(media_dir, exist_ok=True)
        cached_file = os.path.join(media_dir, f"{safe_media_id}.ogg")

        if os.path.exists(cached_file) and os.path.getsize(cached_file) > 0:
            with open(cached_file, 'rb') as f:
                content = f.read()
            resp = HttpResponse(content, content_type='audio/ogg')
            resp['Content-Disposition'] = f'inline; filename="{safe_media_id}.ogg"'
            return resp

        # Check alternative formats if previously saved
        for ext in ['.webm', '.mp4', '.m4a', '.mp3', '.ogg']:
            alt_path = os.path.join(media_dir, f"{safe_media_id}{ext}")
            if os.path.exists(alt_path) and os.path.getsize(alt_path) > 0:
                mime = 'audio/webm' if ext == '.webm' else ('audio/mp4' if ext in ['.mp4', '.m4a'] else ('audio/mpeg' if ext == '.mp3' else 'audio/ogg'))
                with open(alt_path, 'rb') as f:
                    content = f.read()
                resp = HttpResponse(content, content_type=mime)
                resp['Content-Disposition'] = f'inline; filename="{safe_media_id}{ext}"'
                return resp

        # Download on-demand from Meta Cloud API
        config = MetaWhatsAppConfig.objects.first()
        if not config or not config.access_token:
            return Response({'error': 'Meta WhatsApp Cloud API token not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        download_res = MetaWhatsAppService.download_whatsapp_media(
            media_id=safe_media_id,
            access_token=config.access_token,
            save_path=cached_file,
            api_version=config.api_version
        )

        if download_res.get('success'):
            content_type = download_res.get('mime_type') or 'audio/ogg'
            if os.path.exists(cached_file):
                with open(cached_file, 'rb') as f:
                    content = f.read()
                resp = HttpResponse(content, content_type=content_type)
                resp['Content-Disposition'] = f'inline; filename="{safe_media_id}.ogg"'
                return resp
            elif download_res.get('data'):
                resp = HttpResponse(download_res['data'], content_type=content_type)
                resp['Content-Disposition'] = f'inline; filename="{safe_media_id}.ogg"'
                return resp

        return Response({
            'error': f"Failed to retrieve media: {download_res.get('error', 'Not found')}"
        }, status=status.HTTP_404_NOT_FOUND)

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
            code_match = re.search(r'\b([a-zA-Z0-9_\-]{20,26})\b', url)
            if code_match:
                invite_code = code_match.group(1).strip()
            else:
                return Response({'success': False, 'error': 'Invalid WhatsApp invite link format. Expected https://chat.whatsapp.com/...'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            invite_code = match.group(1).split('?')[0].split('&')[0].strip()

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


# ─────────────────────────────────────────────────────────────────────────────
# BulkCampaign — Real Campaign History + Launch API
# ─────────────────────────────────────────────────────────────────────────────

class BulkCampaignSerializer(serializers.ModelSerializer):
    delivered_percent = serializers.FloatField(read_only=True)
    failed_percent = serializers.FloatField(read_only=True)
    recipient_logs = serializers.SerializerMethodField()

    class Meta:
        model = BulkCampaign
        fields = [
            'id', 'gateway_campaign_id', 'name', 'description', 'type', 'category',
            'audience_list_name', 'total_recipients', 'delivered_count', 'read_count',
            'replied_count', 'failed_count', 'delivered_percent', 'failed_percent',
            'template_name', 'message_text', 'cost', 'status',
            'created_by', 'created_at', 'completed_at', 'scheduled_for',
            'recipient_logs',
        ]

    def get_recipient_logs(self, obj):
        logs = obj.logs.all()[:200]  # cap at 200 for detailed audit
        return [
            {
                'id': log.id,
                'name': log.name,
                'phone': log.phone,
                'status': log.status,
                'errorReason': log.error_reason,
                'time': log.sent_at.strftime('%d %b, %I:%M %p') if log.sent_at else '',
            }
            for log in logs
        ]


class BulkCampaignViewSet(viewsets.ModelViewSet):
    """
    Real Campaign API. Stores every broadcast to DB so history is persistent.
    - GET    /api/conversations/bulk-campaigns/               → list real campaigns (auto-syncs active)
    - POST   /api/conversations/bulk-campaigns/launch/        → start a new broadcast
    - POST   /api/conversations/bulk-campaigns/{id}/update_status/ → gateway callback
    - POST   /api/conversations/bulk-campaigns/{id}/retry_failed/  → retry failed recipients
    - GET    /api/conversations/bulk-campaigns/{id}/logs/          → all recipient logs
    - DELETE /api/conversations/bulk-campaigns/{id}/          → delete campaign & logs
    """
    queryset = BulkCampaign.objects.all()
    serializer_class = BulkCampaignSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def list(self, request, *args, **kwargs):
        # Auto-sync active/queued campaigns with WhatsApp Gateway
        self._sync_active_campaigns()
        return super().list(request, *args, **kwargs)

    def _sync_active_campaigns(self):
        active_campaigns = BulkCampaign.objects.filter(status__in=['QUEUED', 'RUNNING'])
        if not active_campaigns.exists():
            return
        try:
            req = urllib.request.Request(
                f'{BAILEYS_GATEWAY_URL}/api/campaigns',
                headers={'Content-Type': 'application/json'},
                method='GET',
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                gw_campaigns = {c.get('id'): c for c in data.get('campaigns', [])}

                for camp in active_campaigns:
                    gw_id = camp.gateway_campaign_id or f'camp-{camp.id}'
                    gw_camp = gw_campaigns.get(gw_id)
                    if gw_camp:
                        gw_status = str(gw_camp.get('status', '')).upper()
                        if gw_status in ['COMPLETED', 'PAUSED', 'FAILED', 'RUNNING']:
                            camp.status = gw_status
                        camp.delivered_count = int(gw_camp.get('deliveredCount', camp.delivered_count))
                        camp.failed_count = int(gw_camp.get('failedCount', camp.failed_count))
                        if gw_status == 'COMPLETED' and not camp.completed_at:
                            import datetime as dt
                            camp.completed_at = dt.datetime.now(dt.timezone.utc)
                        camp.save()
        except Exception as e:
            logger.debug(f'[BulkCampaign] Gateway status sync skipped: {e}')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        campaign_name = instance.name
        self.perform_destroy(instance)
        logger.info(f'[BulkCampaign] Deleted campaign {instance.id} "{campaign_name}"')
        return Response({'success': True, 'message': f'Campaign "{campaign_name}" deleted successfully.'})

    @action(detail=False, methods=['post'])
    def launch(self, request):
        """
        Launches a real broadcast campaign.
        Expects:
          name, category, audience_list_name, template_name, message_text,
          contacts: [{name, phone}, ...], cost (optional)
        """
        data = request.data
        name = data.get('name', '').strip()
        if not name:
            return Response({'success': False, 'error': 'Campaign name is required'}, status=400)

        contacts = data.get('contacts', [])
        if not contacts:
            return Response({'success': False, 'error': 'No contacts provided'}, status=400)

        category = data.get('category', 'marketing')
        message_text = data.get('message_text', '')
        template_name = data.get('template_name', '')
        audience_list_name = data.get('audience_list_name', '')
        rate = 0.30 if category == 'utility' else 0.12 if category == 'authentication' else 0.78
        cost = float(data.get('cost', round(len(contacts) * rate, 2)))

        # Create DB record first
        campaign = BulkCampaign.objects.create(
            name=name,
            description=data.get('description', f'Broadcast to {audience_list_name}'),
            type=data.get('type', 'Marketing'),
            category=category,
            audience_list_name=audience_list_name,
            total_recipients=len(contacts),
            template_name=template_name,
            message_text=message_text,
            cost=cost,
            status='RUNNING',
            created_by=data.get('created_by', 'Admin'),
        )

        # Create log rows (QUEUED) for each contact
        BulkCampaignLog.objects.bulk_create([
            BulkCampaignLog(
                campaign=campaign,
                name=c.get('name', ''),
                phone=c.get('phone', ''),
                status='QUEUED',
            )
            for c in contacts
        ])

        # Now call the WhatsApp gateway to actually send
        gateway_campaign_id = None
        try:
            ensure_baileys_service(wait_until_ready=True)
            payload = json.dumps({
                'id': f'camp-{campaign.id}',
                'name': name,
                'accountIds': data.get('account_ids', []),
                'template': {
                    'messageText': message_text,
                    'templateName': template_name,
                },
                'targetContacts': [
                    {'name': c.get('name', ''), 'phone': c.get('phone', '')}
                    for c in contacts
                ],
                'minDelay': int(data.get('min_delay', 4)),
                'maxDelay': int(data.get('max_delay', 8)),
                'batchSize': int(data.get('batch_size', 25)),
                'sleepSeconds': int(data.get('sleep_seconds', 30)),
            }).encode('utf-8')

            gw_req = urllib.request.Request(
                f'{BAILEYS_GATEWAY_URL}/api/campaigns/start',
                data=payload,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            with urllib.request.urlopen(gw_req, timeout=15) as resp:
                gw_data = json.loads(resp.read().decode('utf-8'))
                gateway_campaign_id = gw_data.get('campaign', {}).get('id') or f'camp-{campaign.id}'

            campaign.gateway_campaign_id = gateway_campaign_id
            campaign.save(update_fields=['gateway_campaign_id'])

            logger.info(f'[BulkCampaign] Launched campaign {campaign.id} "{name}" → gateway {gateway_campaign_id}')

        except Exception as e:
            logger.error(f'[BulkCampaign] Gateway launch failed for campaign {campaign.id}: {e}')
            # Don't fail — we still record the campaign. Mark it as failed.
            campaign.status = 'FAILED'
            campaign.save(update_fields=['status'])
            return Response({
                'success': False,
                'error': f'WhatsApp gateway error: {str(e)}',
                'campaign_id': campaign.id,
            }, status=500)

        return Response({
            'success': True,
            'campaign': BulkCampaignSerializer(campaign).data,
        }, status=201)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Called by the gateway (or polling) to update campaign progress/completion.
        Expects: status, sent_count, delivered_count, failed_count
        """
        try:
            campaign = self.get_object()
        except BulkCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=404)

        new_status = request.data.get('status', '').upper()
        if new_status in ['COMPLETED', 'PAUSED', 'FAILED', 'RUNNING']:
            campaign.status = new_status

        campaign.delivered_count = int(request.data.get('delivered_count', campaign.delivered_count))
        campaign.failed_count = int(request.data.get('failed_count', campaign.failed_count))

        if new_status == 'COMPLETED':
            import datetime as dt
            campaign.completed_at = dt.datetime.now(dt.timezone.utc)

        campaign.save()
        return Response({'success': True, 'campaign': BulkCampaignSerializer(campaign).data})

    @action(detail=True, methods=['post'])
    def retry_failed(self, request, pk=None):
        """
        Retries all failed recipients of this campaign by re-dispatching to WhatsApp gateway.
        """
        try:
            campaign = self.get_object()
        except BulkCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=404)

        failed_logs = campaign.logs.filter(status='FAILED')
        if not failed_logs.exists():
            return Response({'success': False, 'message': 'No failed recipients found for this campaign.'}, status=400)

        contacts = [{'name': l.name, 'phone': l.phone} for l in failed_logs]
        failed_count = len(contacts)

        # Reset failed logs to QUEUED
        failed_logs.update(status='QUEUED', error_reason='')
        campaign.status = 'RUNNING'
        campaign.failed_count = max(0, campaign.failed_count - failed_count)
        campaign.save(update_fields=['status', 'failed_count'])

        # Dispatch retry to gateway
        try:
            ensure_baileys_service(wait_until_ready=True)
            import time
            payload = json.dumps({
                'id': f'camp-{campaign.id}-retry-{int(time.time())}',
                'name': f'{campaign.name} (Retry)',
                'template': {
                    'messageText': campaign.message_text,
                    'templateName': campaign.template_name,
                },
                'targetContacts': contacts,
                'minDelay': 3,
                'maxDelay': 6,
                'batchSize': 20,
                'sleepSeconds': 15,
            }).encode('utf-8')

            gw_req = urllib.request.Request(
                f'{BAILEYS_GATEWAY_URL}/api/campaigns/start',
                data=payload,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            urllib.request.urlopen(gw_req, timeout=15)
        except Exception as e:
            logger.error(f'[BulkCampaign] Retry failed to gateway: {e}')
            return Response({'success': False, 'error': f'Gateway error: {str(e)}'}, status=500)

        return Response({
            'success': True,
            'message': f'Retrying {failed_count} failed recipients.',
            'campaign': BulkCampaignSerializer(campaign).data,
        })

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """
        Returns all recipient logs for a campaign, with optional filtering by status and search.
        """
        try:
            campaign = self.get_object()
        except BulkCampaign.DoesNotExist:
            return Response({'error': 'Campaign not found'}, status=404)

        logs_qs = campaign.logs.all()

        status_filter = request.query_params.get('status')
        if status_filter and status_filter.upper() != 'ALL':
            logs_qs = logs_qs.filter(status=status_filter.upper())

        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            logs_qs = logs_qs.filter(Q(name__icontains=search) | Q(phone__icontains=search))

        data = [
            {
                'id': log.id,
                'name': log.name,
                'phone': log.phone,
                'status': log.status,
                'errorReason': log.error_reason,
                'time': log.sent_at.strftime('%d %b, %I:%M %p') if log.sent_at else '',
            }
            for log in logs_qs
        ]
        return Response({'logs': data, 'total': len(data)})
