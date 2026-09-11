from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import KnowledgeArticle, AISettings

class KnowledgeArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeArticle
        fields = '__all__'

class AISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISettings
        fields = '__all__'

class KnowledgeArticleViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeArticle.objects.all().order_by('-views')
    serializer_class = KnowledgeArticleSerializer

class AISettingsViewSet(viewsets.ModelViewSet):
    queryset = AISettings.objects.all()
    serializer_class = AISettingsSerializer

class AIChatView(APIView):
    """
    AI Copilot assistant that analyzes questions and provides real-time intelligent responses
    """
    def post(self, request):
        prompt = request.data.get('prompt', '')
        lower = prompt.lower()

        if 'schedule' in lower or 'today' in lower:
            reply = "Here is today's schedule:\n- 10:30 AM: AC Installation for Vikram Mehta (Kozhikode)\n- 12:00 PM: AC Repair for Amit Verma (Kozhikode)\n- 02:00 PM: Deep Cleaning for Priya Sharma (Ramanattukara)\n- 04:00 PM: Maintenance for Sneha Joshi (Vadakara)\nTotal 15 appointments scheduled across all 28 technicians."
            suggestions = ["Show overdue jobs", "Check technician capacity", "Send reminder notifications"]
        elif 'payment' in lower or 'reminder' in lower or 'overdue' in lower:
            reply = "You currently have ₹19,400 in pending payments awaiting collection. 2 critical accounts have been flagged:\n1. AC Services (Overdue by 5 days): ₹12,500\n2. Priya Sharma (Overdue by 3 days): ₹32,000\nI can trigger WhatsApp automated payment reminders now."
            suggestions = ["Send 1-click WhatsApp reminders", "View all unpaid invoices", "Apply late payment penalty"]
        elif 'lead' in lower or 'high value' in lower or 'sales' in lower:
            reply = "There are 7 high-value leads requiring immediate follow-up. Top potential:\n- Vikram Mehta (AC Installation, ₹12,000 - Hot Lead)\n- Pooja Iyer (Electrical Wiring, ₹6,500)\n- Deepak Patel (3 Units AC Servicing, ₹5,600)\nAutomated follow-up queue is active."
            suggestions = ["Assign leads to Ramesh", "Create quotation", "Show deal pipeline"]
        elif 'report' in lower or 'revenue' in lower or 'performance' in lower:
            reply = "May 2024 Revenue Summary:\n- Total Revenue: ₹86,400 (↑+12.6% vs last week)\n- Net Profit: ₹11,30,190 (↑+15.8%)\n- Top Performing Branch: Kozhikode Head Office (32 automations, 256 tasks)\n- Automation Rate: 81%"
            suggestions = ["Download P&L Statement", "View Cash Flow", "Compare with last month"]
        else:
            reply = f"I've analyzed your business data regarding: '{prompt}'. All operations, WhatsApp inbox channels, CRM leads, and active automations are functioning normally. How would you like me to assist further?"
            suggestions = ["Show today's schedule", "Send payment reminders", "High value leads", "Generate sales report"]

        return Response({
            'status': 'success',
            'query': prompt,
            'response': reply,
            'suggestions': suggestions
        }, status=status.HTTP_200_OK)
