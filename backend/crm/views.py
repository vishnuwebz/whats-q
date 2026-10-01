from django.db import models
from django.db.models import Q
from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lead, Deal, FollowUp, Customer
from conversations.models import Conversation
import datetime
import re

def extract_clean_phone(phone_str):
    if not phone_str:
        return ''
    digits = ''.join(c for c in str(phone_str) if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def sync_followup_to_lead(followup, is_deleted=False):
    """
    Ensures that any creation, update, or deletion of a FollowUp is immediately
    reflected on the corresponding Lead in the CRM pipeline.
    """
    lead = None
    # 1. Match by Lead # in related_to (e.g. "Lead #12 - John Doe")
    if followup.related_to:
        m = re.search(r'Lead\s*#?(\d+)', followup.related_to, re.IGNORECASE)
        if m:
            try:
                lead = Lead.objects.filter(id=int(m.group(1))).first()
            except (ValueError, TypeError):
                lead = None

    clean_digits = extract_clean_phone(followup.phone)

    # 2. Match by 10-digit phone
    if not lead and clean_digits:
        lead = Lead.objects.filter(phone__icontains=clean_digits).first()

    # 3. Match by exact customer name
    if not lead and followup.customer_name:
        lead = Lead.objects.filter(name__iexact=followup.customer_name.strip()).first()

    if lead:
        clean_lead_phone = extract_clean_phone(lead.phone)
        lead_query = Q(related_to__icontains=f"Lead #{lead.id}")
        if clean_lead_phone:
            lead_query |= Q(phone__icontains=clean_lead_phone)

        if is_deleted:
            other_fu = FollowUp.objects.filter(lead_query).exclude(pk=followup.pk).exclude(status='completed').order_by('due_date', 'due_time').first()
            if other_fu:
                lead.next_follow_up_date = other_fu.due_date
                lead.next_follow_up_time = other_fu.due_time
            else:
                lead.next_follow_up_date = None
                lead.next_follow_up_time = None
        else:
            if followup.status == 'completed':
                other_fu = FollowUp.objects.filter(lead_query).exclude(pk=followup.pk).exclude(status='completed').order_by('due_date', 'due_time').first()
                if other_fu:
                    lead.next_follow_up_date = other_fu.due_date
                    lead.next_follow_up_time = other_fu.due_time
                else:
                    lead.next_follow_up_date = None
                    lead.next_follow_up_time = None
            else:
                lead.next_follow_up_date = followup.due_date
                lead.next_follow_up_time = followup.due_time
                if lead.stage in ['new', 'contacted']:
                    lead.stage = 'follow_up'

            if followup.assigned_to:
                lead.owner = followup.assigned_to
        lead.save()
    elif not is_deleted and followup.customer_name and followup.customer_name.strip() not in ['Customer', '']:
        # Create a new Lead for this prospect if none existed
        service_val = followup.related_to if (followup.related_to and 'Lead #' not in followup.related_to) else 'AC Installation & Repair'
        Lead.objects.create(
            name=followup.customer_name.strip(),
            phone=followup.phone or '',
            service=service_val or 'General Service',
            location='Kozhikode, Kerala',
            value=3500.0,
            stage='follow_up',
            owner=followup.assigned_to or 'Rahul Mehta',
            source='Follow-up',
            notes=followup.notes or f"Follow-up: {followup.title}",
            next_follow_up_date=followup.due_date if followup.status != 'completed' else None,
            next_follow_up_time=followup.due_time if followup.status != 'completed' else None,
        )


def sync_lead_to_followup(lead, is_deleted=False):
    """
    Ensures that changes to a Lead's follow_up stage or next_follow_up_date
    dynamically update or create a corresponding FollowUp.
    """
    clean_digits = extract_clean_phone(lead.phone)
    lead_query = Q(related_to__icontains=f"Lead #{lead.id}")
    if clean_digits:
        lead_query |= Q(phone__icontains=clean_digits)

    existing_fu = FollowUp.objects.filter(lead_query).order_by('-id').first()

    if is_deleted:
        if existing_fu:
            existing_fu.delete()
        return

    if lead.stage == 'follow_up' or lead.next_follow_up_date:
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        due_d = lead.next_follow_up_date or today_str
        due_t = lead.next_follow_up_time or '11:00 AM'
        assigned = lead.owner or 'Vikram Patel'

        if existing_fu:
            existing_fu.customer_name = lead.name
            existing_fu.phone = lead.phone
            existing_fu.assigned_to = assigned
            existing_fu.due_date = due_d
            existing_fu.due_time = due_t
            if existing_fu.status == 'completed':
                existing_fu.status = 'due_today' if due_d == today_str else 'scheduled'
            existing_fu.save()
        else:
            FollowUp.objects.create(
                title=f"Follow-up with {lead.name}",
                related_to=f"Lead #{lead.id} - {lead.name} ({lead.service or 'Service'})",
                customer_name=lead.name,
                phone=lead.phone,
                follow_up_type='whatsapp',
                assigned_to=assigned,
                due_date=due_d,
                due_time=due_t,
                status='due_today' if due_d == today_str else 'scheduled',
                priority='high',
                notes=lead.notes or f"Follow-up scheduled from Leads pipeline for {lead.name}"
            )
    elif lead.stage in ['won', 'lost']:
        pending_fus = FollowUp.objects.filter(lead_query).exclude(status='completed')
        for fu in pending_fus:
            fu.status = 'completed'
            fu.notes = (fu.notes or '') + f"\n[Completed: Lead marked as {lead.stage}]"
            fu.save()


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

class DealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = '__all__'

class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'

    def get_category(self, obj):
        if obj.tags:
            for cat in ['Customer', 'Hot Lead', 'Lead', 'Vendor']:
                if cat in obj.tags:
                    return cat
        return 'Customer'

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-id')
    serializer_class = LeadSerializer

    def perform_create(self, serializer):
        lead = serializer.save()
        sync_lead_to_followup(lead, is_deleted=False)

    def perform_update(self, serializer):
        lead = serializer.save()
        sync_lead_to_followup(lead, is_deleted=False)

    def perform_destroy(self, instance):
        sync_lead_to_followup(instance, is_deleted=True)
        instance.delete()

    @action(detail=True, methods=['post'], url_path='update_stage')
    def update_stage(self, request, pk=None):
        lead = self.get_object()
        new_stage = request.data.get('stage')
        if new_stage:
            lead.stage = new_stage
            now_full = datetime.datetime.now().strftime('%b %d, %Y %I:%M %p')
            lead.last_contact_str = now_full
            if request.data.get('notes'):
                lead.notes = (lead.notes or '') + f"\n[{now_full}] " + str(request.data.get('notes'))
            if request.data.get('owner'):
                lead.owner = request.data.get('owner')
            lead.save()
            sync_lead_to_followup(lead, is_deleted=False)
            from core.events import emit_event
            lead_data = LeadSerializer(lead).data
            emit_event('lead.updated', lead_data)
            return Response(lead_data, status=status.HTTP_200_OK)
        return Response({'error': 'stage is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def convert_to_deal(self, request, pk=None):
        lead = self.get_object()
        data = request.data or {}

        deal_name = data.get('deal_name') or f"{lead.service} - {lead.name}"
        raw_amount = data.get('amount')
        try:
            amount = float(raw_amount) if raw_amount is not None else lead.value
        except (ValueError, TypeError):
            amount = lead.value

        deal_stage = data.get('stage') or 'proposal_sent'
        deal_owner = data.get('deal_owner') or lead.owner
        expected_close_date = data.get('expected_close_date') or 'May 20, 2024'
        notes = data.get('notes') or lead.notes

        deal = Deal.objects.create(
            deal_name=deal_name,
            customer_name=lead.name,
            phone=lead.phone,
            email=lead.email or f"{lead.name.lower().replace(' ', '')}@gmail.com",
            amount=amount,
            stage=deal_stage,
            probability=data.get('probability', 70 if deal_stage == 'won' else 60),
            deal_owner=deal_owner,
            source=lead.source,
            expected_close_date=expected_close_date,
            tags=lead.tags,
            notes=notes
        )
        lead.stage = 'won'
        lead.save()

        # Also create or update customer record in CRM
        if data.get('create_customer', True):
            customer, created = Customer.objects.get_or_create(
                phone=lead.phone,
                defaults={
                    'name': lead.name,
                    'email': lead.email,
                    'address': lead.location,
                    'tags': lead.tags,
                    'notes': notes,
                }
            )
            if not created and not customer.name:
                customer.name = lead.name
                customer.save()

        return Response({
            'status': 'converted',
            'deal': DealSerializer(deal).data,
            'lead': LeadSerializer(lead).data
        }, status=status.HTTP_201_CREATED)

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all().order_by('-id')
    serializer_class = DealSerializer

    @action(detail=False, methods=['post'], url_path='from_conversation')
    def from_conversation(self, request):
        """
        Convert a WhatsApp Conversation directly to a Deal.
        Payload: { conversation_id: <int> }
        """
        conv_id = request.data.get('conversation_id')
        if not conv_id:
            return Response({'error': 'conversation_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            conv = Conversation.objects.get(pk=conv_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        today = datetime.date.today()
        close_date = (today + datetime.timedelta(days=30)).strftime('%b %d, %Y')

        deal = Deal.objects.create(
            deal_name=f"{conv.service_needed or 'Service'} – {conv.contact_name}",
            customer_name=conv.contact_name,
            phone=conv.phone_number,
            email='',
            amount=conv.estimated_value or 2800.0,
            stage='proposal_sent',
            probability=60,
            deal_owner=conv.lead_owner or 'Ramesh Kumar',
            source=conv.source or 'WhatsApp',
            expected_close_date=close_date,
            tags=conv.tags or ['WhatsApp Inbound'],
            notes=conv.notes or f"Converted from WhatsApp conversation on {today.strftime('%b %d, %Y')}."
        )
        return Response({'status': 'converted', 'deal': DealSerializer(deal).data}, status=status.HTTP_201_CREATED)

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('id')
    serializer_class = FollowUpSerializer

    def perform_create(self, serializer):
        followup = serializer.save()
        sync_followup_to_lead(followup, is_deleted=False)
        try:
            from .services import notify_assigned_employee_via_whatsapp
            notify_assigned_employee_via_whatsapp(followup)
        except Exception as e:
            pass

    def perform_update(self, serializer):
        followup = serializer.save()
        sync_followup_to_lead(followup, is_deleted=False)

    def perform_destroy(self, instance):
        sync_followup_to_lead(instance, is_deleted=True)
        instance.delete()

    @action(detail=True, methods=['post'], url_path='notify_employee')
    def notify_employee(self, request, pk=None):
        followup = self.get_object()
        from .services import notify_assigned_employee_via_whatsapp
        res = notify_assigned_employee_via_whatsapp(followup)
        return Response(res, status=status.HTTP_200_OK)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-id')
    serializer_class = CustomerSerializer

    def get_queryset(self):
        qs = Customer.objects.all().order_by('-id')
        branch = self.request.query_params.get('branch')
        city = self.request.query_params.get('city')
        search = self.request.query_params.get('search')
        if branch and branch != 'all':
            qs = qs.filter(Q(tags__icontains=branch) | Q(address__icontains=branch))
        if city and city != 'all':
            qs = qs.filter(address__icontains=city)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search) | Q(address__icontains=search))
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Normalize phone
        phone = data.get('phone') or data.get('phone_number') or ''
        phone = str(phone).strip()
        data['phone'] = phone

        # Normalize name
        name = data.get('name') or data.get('contact_name') or ''
        data['name'] = str(name).strip()

        # Normalize address / location
        address = data.get('address') or data.get('location') or 'Kozhikode, Kerala'
        data['address'] = str(address).strip()

        # Normalize tags & category
        category = data.get('category')
        tags = data.get('tags')
        if tags is None:
            tags = []
        elif isinstance(tags, str):
            tags = [tags]
        elif not isinstance(tags, list):
            tags = list(tags)

        if category and category not in tags:
            tags.append(category)
        data['tags'] = tags

        # Set first_seen if not provided
        if not data.get('first_seen'):
            data['first_seen'] = datetime.date.today().strftime('%b %d, %Y')

        # Check if customer already exists by phone
        customer_obj = None
        if phone:
            digits_only = ''.join(c for c in phone if c.isdigit())
            clean_digits = digits_only[-10:] if len(digits_only) >= 10 else digits_only
            customer_obj = Customer.objects.filter(phone=phone).first()
            if not customer_obj and clean_digits:
                customer_obj = Customer.objects.filter(phone__icontains=clean_digits).first()

        if customer_obj:
            if data.get('check_duplicate_only'):
                return Response({
                    'duplicate': True,
                    'existing_id': customer_obj.id,
                    'existing_name': customer_obj.name,
                    'existing_phone': customer_obj.phone,
                    'existing_category': customer_obj.tags[0] if customer_obj.tags else 'Customer',
                    'message': f"Phone number {phone} is already registered to {customer_obj.name}"
                }, status=status.HTTP_409_CONFLICT)

            if data.get('delete_existing_and_create'):
                customer_obj.delete()
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                response_data = serializer.data
                response_status = status.HTTP_201_CREATED
            else:
                serializer = self.get_serializer(customer_obj, data=data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                response_data = serializer.data
                response_status = status.HTTP_200_OK
        else:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            response_data = serializer.data
            response_status = status.HTTP_201_CREATED

        # Ensure a synchronized Conversation thread exists
        if phone:
            digits_only = ''.join(c for c in phone if c.isdigit())
            clean_digits = digits_only[-10:] if len(digits_only) >= 10 else digits_only
            conv = None
            if clean_digits:
                conv = Conversation.objects.filter(phone_number__icontains=clean_digits).first()
            if not conv and name:
                conv = Conversation.objects.filter(contact_name__iexact=name).first()

            target_cat = category if category in ['Customer', 'Hot Lead', 'Lead', 'Vendor'] else 'Customer'
            if conv:
                if target_cat:
                    conv.category = target_cat
                if name and (not conv.contact_name or conv.contact_name == 'New Contact'):
                    conv.contact_name = name
                conv.save()
            else:
                Conversation.objects.create(
                    contact_name=name or 'New Customer',
                    phone_number=phone,
                    category=target_cat,
                    status='open',
                    location=address,
                    lead_owner='Unassigned',
                    lead_stage=target_cat,
                    source='CRM Directory',
                    notes=data.get('notes', 'Added from Customers 360 Directory'),
                    first_contact_date='Today',
                    last_contact_date='Just now',
                    unread_count=0,
                )

        return Response(response_data, status=response_status)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Normalize fields
        if 'phone_number' in data and not data.get('phone'):
            data['phone'] = data.get('phone_number')
        if 'contact_name' in data and not data.get('name'):
            data['name'] = data.get('contact_name')
        if 'location' in data and not data.get('address'):
            data['address'] = data.get('location')

        category = data.get('category')
        if category:
            tags = data.get('tags')
            if tags is None:
                tags = list(instance.tags or [])
            elif isinstance(tags, str):
                tags = [tags]
            elif not isinstance(tags, list):
                tags = list(tags)
            if category not in tags:
                tags.append(category)
            data['tags'] = tags

        old_phone = instance.phone
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Also sync conversation
        new_phone = serializer.data.get('phone') or old_phone
        new_name = serializer.data.get('name')
        new_address = serializer.data.get('address')
        if new_phone or old_phone:
            old_digits = ''.join(c for c in old_phone if c.isdigit())[-10:] if old_phone else ''
            new_digits = ''.join(c for c in new_phone if c.isdigit())[-10:] if new_phone else ''
            conv = None
            if old_digits:
                conv = Conversation.objects.filter(phone_number__icontains=old_digits).first()
            if not conv and new_digits:
                conv = Conversation.objects.filter(phone_number__icontains=new_digits).first()
            if conv:
                if new_name:
                    conv.contact_name = new_name
                if new_phone:
                    conv.phone_number = new_phone
                if new_address:
                    conv.location = new_address
                if category and category in ['Customer', 'Hot Lead', 'Lead', 'Vendor']:
                    conv.category = category
                    conv.lead_stage = category
                conv.save()

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        phone = instance.phone
        digits = ''.join(c for c in phone if c.isdigit())[-10:] if phone else ''
        self.perform_destroy(instance)

        # Also remove or clean up in Conversation
        if digits:
            Conversation.objects.filter(phone_number__icontains=digits).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


