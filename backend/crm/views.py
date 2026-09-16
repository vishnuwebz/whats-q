from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lead, Deal, FollowUp, Customer
from conversations.models import Conversation
import datetime

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
    class Meta:
        model = Customer
        fields = '__all__'

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-id')
    serializer_class = LeadSerializer

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

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-id')
    serializer_class = CustomerSerializer
