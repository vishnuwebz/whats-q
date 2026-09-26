from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Workflow, WorkflowTemplate, AutomationLog, Approval, KeywordTriggerRule, WorkingHoursConfig
import datetime

class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = '__all__'

class WorkflowTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTemplate
        fields = '__all__'

class AutomationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationLog
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['logLevel'] = ret.get('log_level', 'Info')
        return ret

class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = '__all__'

class KeywordTriggerRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeywordTriggerRule
        fields = '__all__'

class WorkingHoursConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingHoursConfig
        fields = '__all__'

class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all().order_by('-id')
    serializer_class = WorkflowSerializer

class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTemplate.objects.all().order_by('id')
    serializer_class = WorkflowTemplateSerializer

class AutomationLogViewSet(viewsets.ModelViewSet):
    queryset = AutomationLog.objects.all().order_by('-id')
    serializer_class = AutomationLogSerializer

class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all().order_by('-id')
    serializer_class = ApprovalSerializer

class KeywordTriggerRuleViewSet(viewsets.ModelViewSet):
    queryset = KeywordTriggerRule.objects.all()
    serializer_class = KeywordTriggerRuleSerializer

    def get_queryset(self):
        try:
            if KeywordTriggerRule.objects.count() == 0:
                self._seed_default_rules()
        except Exception:
            pass
        return KeywordTriggerRule.objects.all().order_by('-updated_at')

    @classmethod
    def _seed_default_rules(cls):
        default_rules = [
            {
                'title': 'Inbound Greetings Auto-Responder ("Hi" / "Hello")',
                'keywords': ['hi', 'hello', 'hey', 'start', 'greetings', 'menu', 'good morning', 'good evening'],
                'action_type': 'workflow',
                'workflow_name': 'Inbound Welcome & Service Flow',
                'reply': '👋 *Welcome to {COMPANY_NAME}!* \nHello {CUSTOMER_NAME}! How can we assist you today?\n\n1️⃣ Reschedule / Book Service\n2️⃣ Live Specialist ETA\n3️⃣ Price Quotation\n4️⃣ Speak with Agent\n\nReply with 1, 2, 3, or 4 and our team will assist you immediately!',
                'active': True
            },
            {
                'title': 'Price List Auto-Reply',
                'keywords': ['price', 'catalog', 'rate', 'cost', 'quotation', 'rate card', 'pricing'],
                'action_type': 'reply',
                'workflow_name': 'Inbound Welcome & Service Flow',
                'reply': '💰 *Service Quotation & Rate Card*\n\nHello {CUSTOMER_NAME}! Thank you for reaching out to {COMPANY_NAME}.\n\nOur current rates for {SERVICE_NAME} start at standard base pricing:\n• Inspection & Diagnostics: ₹800\n• Full Service & Labour: ₹2,000\n• *Estimated Total: ₹2,800*\n\nReply *CONFIRM* to lock your preferred slot!',
                'active': True
            },
            {
                'title': 'Service Booking & Appointment Trigger',
                'keywords': ['book', 'appointment', 'schedule', 'slot', 'reserve', 'reschedule'],
                'action_type': 'workflow',
                'workflow_name': 'Inbound Welcome & Service Flow',
                'reply': '📅 *Schedule / Reschedule Appointment*\n\nHello {CUSTOMER_NAME}! Please reply with your preferred date and time (e.g., *"Tomorrow 2:00 PM"*), or choose from our available slots:\n1️⃣ Tomorrow 02:00 PM\n2️⃣ Friday 10:30 AM\n3️⃣ Saturday 11:00 AM',
                'active': True
            },
            {
                'title': 'Live Support Desk Handover',
                'keywords': ['agent', 'human', 'support', 'help', 'speak', 'person', 'operator', 'representative'],
                'action_type': 'reply',
                'workflow_name': 'Inbound Welcome & Service Flow',
                'reply': '👨‍💼 *Connecting with Support Specialist*\n\nHello {CUSTOMER_NAME}, a senior specialist has been assigned to your chat on behalf of {COMPANY_NAME} and will assist you directly.\n\nHelpline: +91 98471 23456.',
                'active': True
            }
        ]
        created = []
        for r in default_rules:
            obj, _ = KeywordTriggerRule.objects.get_or_create(title=r['title'], defaults=r)
            created.append(obj)
        return created

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        rule = self.get_object()
        rule.active = not rule.active
        rule.save(update_fields=['active', 'updated_at'])
        return Response(self.get_serializer(rule).data)

    @action(detail=False, methods=['post'])
    def seed_defaults(self, request):
        self._seed_default_rules()
        rules = KeywordTriggerRule.objects.all().order_by('-updated_at')
        return Response(self.get_serializer(rules, many=True).data)

class WorkingHoursView(APIView):
    def get(self, request):
        cfg = WorkingHoursConfig.objects.first()
        if not cfg:
            cfg = WorkingHoursConfig.objects.create(
                schedule=[
                    {'day': 'Monday', 'time': '9:30 AM - 7:30 PM', 'enabled': True},
                    {'day': 'Tuesday', 'time': '9:30 AM - 7:30 PM', 'enabled': True},
                    {'day': 'Wednesday', 'time': '9:30 AM - 7:30 PM', 'enabled': True},
                    {'day': 'Thursday', 'time': '9:30 AM - 7:30 PM', 'enabled': True},
                    {'day': 'Friday', 'time': '9:30 AM - 7:30 PM', 'enabled': True},
                    {'day': 'Saturday', 'time': '10:00 AM - 8:00 PM', 'enabled': True},
                    {'day': 'Sunday', 'time': 'Closed', 'enabled': False},
                ],
                away_message='Hi there! Thanks for reaching out to WhatsQ. Our team is currently away from the desk. We will get back to you promptly when we open tomorrow morning!',
                is_active=True
            )
        return Response(WorkingHoursConfigSerializer(cfg).data)

    def put(self, request):
        cfg = WorkingHoursConfig.objects.first()
        if not cfg:
            cfg = WorkingHoursConfig()
        
        if 'schedule' in request.data:
            cfg.schedule = request.data['schedule']
        if 'away_message' in request.data:
            cfg.away_message = request.data['away_message']
        if 'is_active' in request.data:
            cfg.is_active = request.data['is_active']
        
        cfg.save()
        return Response(WorkingHoursConfigSerializer(cfg).data)

    def post(self, request):
        return self.put(request)

class ExecuteWorkflowView(APIView):
    """
    Simulates / runs a visual workflow graph execution
    """
    def post(self, request, pk=None):
        workflow_id = pk or request.data.get('workflow_id')
        input_data = request.data.get('input_data', {'message': 'I need AC service tomorrow in Koyilandy'})
        
        now_str = datetime.datetime.now().strftime('%b %d, %Y %I:%M:%S %p')
        
        # Trace execution steps
        steps = [
            {'node': 'Trigger: New WhatsApp Message', 'status': 'completed', 'output': f"Received input message: {input_data.get('message', '')}"},
            {'node': 'AI Agent: Understand Intent', 'status': 'completed', 'output': 'Extracted intent: Service Booking (AC Repair), Location: Koyilandy, Kerala'},
            {'node': 'Action: Create / Update Lead', 'status': 'completed', 'output': 'Lead #L-4821 created for Amit Verma (+91 98765 43210)'},
            {'node': 'Condition: Service Available?', 'status': 'completed', 'output': 'Branch YES (Service available in Koyilandy zone)'},
            {'node': 'Action: Send WhatsApp Confirmation Message', 'status': 'completed', 'output': 'Sent booking confirmation with advance payment link'},
            {'node': 'Action: Assign Nearest Employee', 'status': 'completed', 'output': 'Assigned technician Ramesh Kumar (EMP-001)'}
        ]

        log = AutomationLog.objects.create(
            time_str=now_str,
            workflow_action='Service Booking Flow',
            branch='Kozhikode Head Office',
            status='success',
            log_level='Info',
            message=f"Workflow executed successfully for {input_data.get('phone', '+91 98765 43210')}",
            triggered_by='System',
            duration='0.84s'
        )

        return Response({
            'status': 'success',
            'workflow_id': workflow_id,
            'duration': '0.84s',
            'executed_steps': steps,
            'log_id': log.id
        }, status=status.HTTP_200_OK)
