from rest_framework import serializers, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Workflow, WorkflowTemplate, AutomationLog, Approval
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
