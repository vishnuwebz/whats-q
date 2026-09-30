import re
import datetime
import time
import logging
import threading
from django.db.models import Q
from core.events import emit_event
from .models import Lead, FollowUp

logger = logging.getLogger(__name__)

def extract_clean_phone(phone_str):
    if not phone_str:
        return ''
    digits = ''.join(c for c in str(phone_str) if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def find_lead_by_phone_or_name(phone, contact_name=None):
    clean_digits = extract_clean_phone(phone)
    if clean_digits:
        lead = Lead.objects.filter(phone__icontains=clean_digits).order_by('-id').first()
        if lead:
            return lead
        # Robust scan matching normalized clean digits across existing leads
        for cand in Lead.objects.all().order_by('-id')[:200]:
            if extract_clean_phone(cand.phone) == clean_digits:
                return cand

    if contact_name and contact_name.strip() not in ['WhatsApp Customer', 'Customer', 'Valued Customer', '']:
        lead = Lead.objects.filter(name__iexact=contact_name.strip()).order_by('-id').first()
        if lead:
            return lead
    return None


def sync_inbound_message_to_crm_lead(phone, contact_name, message_text, owner=None, source='WhatsApp', service=None, location=None):
    """
    Dynamically syncs an incoming customer message into the CRM Leads pipeline.
    If a Lead does not exist for this phone number, creates a 'new' lead automatically.
    If a Lead already exists, updates last_contact_str and ensures customer name is synced.
    Emits real-time events for instant UI synchronization.
    """
    clean_digits = extract_clean_phone(phone)
    if not clean_digits or len(clean_digits) < 7:
        logger.warning(f"[CRM Sync] Cannot sync lead: invalid phone '{phone}'")
        return None

    # Exclude system business line from creating a lead on itself
    if clean_digits in ['9496300233', '9876543210']:
        return None

    now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
    clean_phone_display = phone if str(phone).startswith('+') else f"+{phone}"

    # Search for matching lead
    lead = find_lead_by_phone_or_name(phone, contact_name)

    from .views import LeadSerializer

    if not lead:
        # Determine appropriate name
        resolved_name = contact_name.strip() if (contact_name and contact_name.strip() not in ['WhatsApp Customer', 'Customer', 'Valued Customer', '']) else f"Customer (+{clean_digits[-4:]})"
        lead = Lead.objects.create(
            name=resolved_name,
            phone=clean_phone_display,
            service=service or 'WhatsApp Inquiry',
            location=location or 'Kozhikode, Kerala',
            value=3000.0,
            stage='new',
            owner=owner or 'Unassigned',
            source=source or 'WhatsApp Inbound',
            created_at_str=now_full,
            last_contact_str=now_full,
            notes=f"Inbound inquiry: \"{str(message_text)[:150]}\"",
            tags=['WhatsApp Inbound', 'Auto-Synced Lead'],
        )
        logger.info(f"[CRM Sync] Automatically created new CRM Lead #{lead.id} ({lead.name}) from incoming WhatsApp message")

        lead_data = LeadSerializer(lead).data
        emit_event('lead.created', lead_data)
        emit_event('lead.updated', lead_data)
        emit_event('notification.new', {
            'id': int(time.time() * 1000),
            'title': f"🎯 New Lead Synced: {lead.name}",
            'text': f"Received incoming WhatsApp message: \"{str(message_text)[:60]}...\". Added to CRM leads pipeline.",
            'time': 'Just now',
            'unread': True,
            'target': 'crm-leads',
            'itemId': lead.id,
            'itemType': 'lead',
            'severity': 'success'
        })
    else:
        # Update existing lead's recency and contact name if improved
        updated = False
        lead.last_contact_str = now_full
        updated = True

        if contact_name and contact_name.strip() not in ['WhatsApp Customer', 'Customer', 'Valued Customer', '']:
            if lead.name in ['WhatsApp Customer', 'Customer', 'Valued Customer', ''] or lead.name.startswith('Customer (+'):
                lead.name = contact_name.strip()
                updated = True

        if message_text and not lead.notes:
            lead.notes = f"Inbound message: \"{str(message_text)[:150]}\""
            updated = True

        if updated:
            lead.save()
            lead_data = LeadSerializer(lead).data
            emit_event('lead.updated', lead_data)
            logger.info(f"[CRM Sync] Updated existing CRM Lead #{lead.id} ({lead.name}) with latest inbound contact timestamp")

    return lead


def mark_lead_contacted_from_reply(phone=None, contact_name=None, owner_name=None, reply_text=None, **kwargs):
    """
    Whenever an agent or employee manually replies to a conversation,
    advances the corresponding CRM Lead's stage to 'contacted' if it was 'new'.
    Also updates last_contact_str and emits real-time events.
    """
    clean_digits = extract_clean_phone(phone)
    if not clean_digits and not contact_name:
        return None

    lead = find_lead_by_phone_or_name(phone, contact_name)

    if lead:
        now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
        lead.last_contact_str = now_full
        
        # If employee replied and lead had no owner, assign to employee
        if owner_name and owner_name not in ['Unassigned', 'Support Desk', 'Meta Cloud API', ''] and lead.owner in ['Unassigned', '']:
            lead.owner = owner_name

        from .views import LeadSerializer
        if lead.stage == 'new':
            lead.stage = 'contacted'
            lead.save()
            logger.info(f"[CRM Sync] Lead #{lead.id} ({lead.name}) transitioned from 'new' to 'contacted' after manual agent reply")
            lead_data = LeadSerializer(lead).data
            emit_event('lead.updated', lead_data)
            emit_event('notification.new', {
                'id': int(time.time() * 1000),
                'title': f"📞 Lead Contacted: {lead.name}",
                'text': f"Manual reply sent. Moved lead to 'Contacted' stage in CRM.",
                'time': 'Just now',
                'unread': True,
                'target': 'crm-leads',
                'itemId': lead.id,
                'itemType': 'lead',
                'severity': 'info'
            })
        else:
            lead.save()
            lead_data = LeadSerializer(lead).data
            emit_event('lead.updated', lead_data)
    elif clean_digits and len(clean_digits) >= 7:
        # If lead did not exist in CRM, auto-create it directly in 'contacted' stage!
        from .views import LeadSerializer
        now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
        clean_phone_display = phone if str(phone).startswith('+') else f"+{phone}"
        resolved_name = contact_name.strip() if (contact_name and contact_name.strip() not in ['WhatsApp Customer', 'Customer', 'Valued Customer', '']) else f"Customer (+{clean_digits[-4:]})"
        lead = Lead.objects.create(
            name=resolved_name,
            phone=clean_phone_display,
            service='WhatsApp Inquiry',
            location='Kozhikode, Kerala',
            value=2800.0,
            stage='contacted',
            owner=owner_name or 'Rahul Mehta',
            source='WhatsApp Outbound',
            created_at_str=now_full,
            last_contact_str=now_full,
            notes=f"Contacted on WhatsApp: \"{str(reply_text or '')[:150]}\"",
            tags=['WhatsApp Contacted', 'Auto-Synced Lead'],
        )
        lead_data = LeadSerializer(lead).data
        emit_event('lead.created', lead_data)
        emit_event('lead.updated', lead_data)
        logger.info(f"[CRM Sync] Auto-created new CRM Lead #{lead.id} ({lead.name}) in 'contacted' stage upon manual reply")

    return lead


def notify_assigned_employee_via_whatsapp(followup):
    """
    Dispatches a WhatsApp notification to the assigned employee about their follow-up task.
    Instructions direct the employee to check WhatsApp and log in to their Employee Dashboard
    to chat with this customer and manage lead pipeline updates (Contacted, Follow-up, Negotiation, Won, Lost).
    """
    assigned_name = getattr(followup, 'assigned_to', None)
    if not assigned_name:
        return {'success': False, 'error': 'No employee assigned'}

    emp = None
    try:
        from operations.models import Employee
        emp = Employee.objects.filter(name__iexact=assigned_name.strip()).first()
        if not emp:
            emp = Employee.objects.filter(name__icontains=assigned_name.strip()).first()
    except Exception as e:
        logger.warning(f"[CRM Notification] Could not query Employee model: {e}")

    target_phone = emp.phone if emp and emp.phone else None
    if not target_phone:
        logger.info(f"[CRM Notification] Employee '{assigned_name}' has no phone registered in Employee directory")
        return {'success': False, 'error': f"No phone number on record for employee '{assigned_name}'"}

    notification_text = (
        f"🔔 *New Lead Follow-Up Assigned!*\n\n"
        f"Hello *{assigned_name}*,\n"
        f"You have been assigned a customer follow-up in *Qiyam Business OS*:\n\n"
        f"👤 *Customer:* {followup.customer_name} ({followup.phone or 'WhatsApp'})\n"
        f"📌 *Topic / Inquiry:* {followup.related_to or followup.title}\n"
        f"📅 *Due Date & Time:* {followup.due_date} at {followup.due_time}\n"
        f"⚡ *Priority:* {getattr(followup, 'priority', 'high').upper()}\n"
        f"📝 *Notes:* {followup.notes or 'Inquiry via WhatsApp'}\n\n"
        f"👉 *Action Required:*\n"
        f"Please check your WhatsApp & log in to your *Employee Dashboard* on Qiyam Business OS to chat directly with this customer via WhatsApp and update their stage (*Contacted, Follow-up, Negotiation, Won, Lost*)."
    )

    def _async_send():
        try:
            import django
            django.db.connections.close_all()
            meta_sent = False

            # 1. Try Meta WhatsApp Cloud API
            try:
                from conversations.models import MetaWhatsAppConfig
                from conversations.meta_service import MetaWhatsAppService
                cfg = MetaWhatsAppConfig.objects.first()
                if cfg and cfg.access_token and cfg.phone_number_id and cfg.connection_status == 'connected':
                    res = MetaWhatsAppService.send_whatsapp_text(
                        phone_number_id=cfg.phone_number_id,
                        access_token=cfg.access_token,
                        to_phone=target_phone,
                        text=notification_text,
                        api_version=cfg.api_version
                    )
                    if res and res.get('success'):
                        meta_sent = True
                        logger.info(f"[CRM Notification] Sent WhatsApp notification to employee {assigned_name} ({target_phone}) via Meta Cloud API")
            except Exception as meta_err:
                logger.warning(f"[CRM Notification] Meta Cloud API notification failed: {meta_err}")

            # 2. Try Baileys Gateway if Meta was not sent
            if not meta_sent:
                try:
                    from conversations.views import call_baileys_gateway
                    clean_recipient = re.sub(r'[^\d]', '', str(target_phone))
                    b_res = call_baileys_gateway('/api/messages/send-direct', method='POST', data={
                        'recipientPhone': clean_recipient,
                        'messageText': notification_text
                    })
                    if b_res and b_res.get('success'):
                        logger.info(f"[CRM Notification] Sent WhatsApp notification to employee {assigned_name} ({target_phone}) via Baileys Gateway")
                    else:
                        logger.warning(f"[CRM Notification] Baileys Gateway notification failed: {b_res}")
                except Exception as b_err:
                    logger.warning(f"[CRM Notification] Baileys notification call failed: {b_err}")
        except Exception as outer_err:
            logger.warning(f"[CRM Notification] Async send worker error: {outer_err}")

    threading.Thread(target=_async_send, daemon=True).start()

    # Emit real-time toast / notification
    emit_event('notification.new', {
        'id': int(time.time() * 1000),
        'title': f"📲 WhatsApp Sent to {assigned_name}",
        'text': f"Follow-up for {followup.customer_name} assigned. Employee notified on WhatsApp & requested to check dashboard to update stages.",
        'time': 'Just now',
        'unread': True,
        'target': 'employee-portal',
        'itemId': followup.id,
        'itemType': 'followup',
        'severity': 'info'
    })

    return {'success': True, 'employee_phone': target_phone}
