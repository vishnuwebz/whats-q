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
        deal = Deal.objects.create(
            deal_name=f"{lead.service} - {lead.name}",
            customer_name=lead.name,
            phone=lead.phone,
            email=lead.email or f"{lead.name.lower().replace(' ', '')}@gmail.com",
            amount=lead.value,
            stage='proposal_sent',
            probability=60,
            deal_owner=lead.owner,
            source=lead.source,
            expected_close_date='May 20, 2024',
            tags=lead.tags,
            notes=lead.notes
        )
        lead.stage = 'won'
        lead.save()
        return Response({'status': 'converted', 'deal': DealSerializer(deal).data}, status=status.HTTP_201_CREATED)

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
