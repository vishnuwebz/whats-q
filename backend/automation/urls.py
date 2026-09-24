from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkflowViewSet,
    WorkflowTemplateViewSet,
    AutomationLogViewSet,
    ApprovalViewSet,
    KeywordTriggerRuleViewSet,
    WorkingHoursView,
    ExecuteWorkflowView
)

router = DefaultRouter()
router.register(r'workflows', WorkflowViewSet)
router.register(r'templates', WorkflowTemplateViewSet)
router.register(r'logs', AutomationLogViewSet)
router.register(r'approvals', ApprovalViewSet)
router.register(r'keyword-rules', KeywordTriggerRuleViewSet)

urlpatterns = [
    path('execute/', ExecuteWorkflowView.as_view(), name='workflow_execute'),
    path('workflows/<int:pk>/execute/', ExecuteWorkflowView.as_view(), name='workflow_execute_by_id'),
    path('working-hours/', WorkingHoursView.as_view(), name='working_hours_config'),
    path('', include(router.urls)),
]
