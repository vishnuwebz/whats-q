from rest_framework import serializers, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Workspace, Branch, Integration
from crm.models import Lead, Deal, Customer
from conversations.models import Conversation, WhatsAppTemplate
from operations.models import Job, Employee
from finance.models import Invoice

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = '__all__'

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = '__all__'

class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class IntegrationViewSet(viewsets.ModelViewSet):
    queryset = Integration.objects.all()
    serializer_class = IntegrationSerializer


class GlobalSearchView(APIView):
    """Cross-module search for header and command palette."""

    def get(self, request):
        q = (request.GET.get('q') or '').strip()
        if len(q) < 2:
            return Response([])

        ql = q.lower()
        results = []

        for lead in Lead.objects.filter(
            Q(name__icontains=q) | Q(phone__icontains=q) | Q(service__icontains=q)
        )[:8]:
            results.append({
                'type': 'lead',
                'id': lead.id,
                'title': lead.name,
                'subtitle': f'{lead.service} • ₹{lead.value}',
                'tab': 'crm-leads',
            })

        for conv in Conversation.objects.filter(
            Q(contact_name__icontains=q) | Q(phone_number__icontains=q)
        )[:8]:
            results.append({
                'type': 'conversation',
                'id': conv.id,
                'title': conv.contact_name,
                'subtitle': conv.phone_number,
                'tab': 'conversations',
            })

        for job in Job.objects.filter(
            Q(customer_name__icontains=q) | Q(job_id_str__icontains=q)
        )[:6]:
            results.append({
                'type': 'job',
                'id': job.id,
                'title': job.job_id_str,
                'subtitle': f'{job.customer_name} • {job.service}',
                'tab': 'ops-jobs',
            })

        for inv in Invoice.objects.filter(
            Q(invoice_number__icontains=q) | Q(customer_name__icontains=q)
        )[:6]:
            results.append({
                'type': 'invoice',
                'id': inv.id,
                'title': inv.invoice_number,
                'subtitle': f'{inv.customer_name} • ₹{inv.amount}',
                'tab': 'finance-invoices',
            })

        for tmpl in WhatsAppTemplate.objects.filter(name__icontains=ql)[:5]:
            results.append({
                'type': 'template',
                'id': tmpl.id,
                'title': tmpl.name,
                'subtitle': tmpl.meta_status,
                'tab': 'template-hub',
            })

        for deal in Deal.objects.filter(deal_name__icontains=q)[:5]:
            results.append({
                'type': 'deal',
                'id': deal.id,
                'title': deal.deal_name,
                'subtitle': f'₹{deal.amount}',
                'tab': 'crm-deals',
            })

        for cust in Customer.objects.filter(Q(name__icontains=q) | Q(phone__icontains=q))[:5]:
            results.append({
                'type': 'customer',
                'id': cust.id,
                'title': cust.name,
                'subtitle': cust.phone,
                'tab': 'crm-customers',
            })

        for emp in Employee.objects.filter(
            Q(name__icontains=q) | Q(employee_id_str__icontains=q) | Q(role__icontains=q)
        )[:5]:
            results.append({
                'type': 'employee',
                'id': emp.id,
                'title': emp.name,
                'subtitle': f'{emp.role} • {emp.department}',
                'tab': 'ops-employees',
            })

        return Response(results[:25])

from .update_service import SystemUpdateService
from .events import event_bus
from django.http import StreamingHttpResponse
import json
import time
import queue

class SystemVersionView(APIView):
    """
    Returns current version, latest available version, and update status.
    """
    def get(self, request):
        info = SystemUpdateService.get_version_info()
        return Response(info)

class SystemUpdateView(APIView):
    """
    Triggers automated backup & live update on the host.
    """
    def post(self, request):
        result = SystemUpdateService.apply_update()
        status_code = 200 if result.get('success') else 400
        return Response(result, status=status_code)

class EventStreamView(APIView):
    """
    Server-Sent Events (SSE) streaming endpoint.
    Keeps an open HTTP connection and streams real-time updates as they happen.
    Includes heartbeat pings every 15s to maintain connection across proxies and load balancers.
    """
    def get(self, request):
        def event_generator():
            client_queue = event_bus.subscribe()
            try:
                # Send initial connected handshake
                init_data = json.dumps({
                    'type': 'system.connected',
                    'timestamp': time.time(),
                    'active_clients': event_bus.active_subscribers_count
                })
                yield f"data: {init_data}\n\n"

                last_heartbeat = time.time()
                while True:
                    try:
                        # Wait up to 5 seconds for an event
                        event = client_queue.get(timeout=5.0)
                        payload = json.dumps(event)
                        yield f"id: {event['id']}\nevent: {event['type']}\ndata: {payload}\n\n"
                    except queue.Empty:
                        pass

                    # Periodic heartbeat to keep socket open
                    now = time.time()
                    if now - last_heartbeat > 15.0:
                        yield f": heartbeat {int(now)}\n\n"
                        last_heartbeat = now
            finally:
                event_bus.unsubscribe(client_queue)

        response = StreamingHttpResponse(event_generator(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache, no-transform'
        response['X-Accel-Buffering'] = 'no' # Disable Nginx proxy buffering for instant delivery
        return response

class EventSyncView(APIView):
    """
    Delta sync endpoint returning all events since a given timestamp.
    Used for instant state reconciliation or when SSE is unavailable.
    """
    def get(self, request):
        try:
            since = float(request.GET.get('since', 0))
        except (ValueError, TypeError):
            since = 0.0

        events = event_bus.get_events_since(since)
        return Response({
            'events': events,
            'server_time': time.time(),
            'active_subscribers': event_bus.active_subscribers_count
        })

