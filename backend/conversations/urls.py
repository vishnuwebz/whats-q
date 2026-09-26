from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationViewSet,
    MessageViewSet,
    WhatsAppTemplateViewSet,
    MetaConfigViewSet,
    WhatsAppWebhookView,
    WhatsAppMediaProxyView,
    SimulateWhatsAppMessageView,
    StartWhatsAppChatView,
    InspectGroupInviteView,
    LinkedEmployeeDeviceViewSet,
    BulkCampaignViewSet,
    SuppressionViewSet,
)
from .grabber_views import GroupGrabberSessionView

router = DefaultRouter()
router.register(r'threads', ConversationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'templates', WhatsAppTemplateViewSet)
router.register(r'meta-config', MetaConfigViewSet, basename='meta-config')
router.register(r'linked-devices', LinkedEmployeeDeviceViewSet, basename='linked-devices')
router.register(r'bulk-campaigns', BulkCampaignViewSet, basename='bulk-campaigns')
router.register(r'suppression', SuppressionViewSet, basename='suppression')

urlpatterns = [
    path('webhook/', WhatsAppWebhookView.as_view(), name='whatsapp_webhook'),
    path('media/<str:media_id>/', WhatsAppMediaProxyView.as_view(), name='whatsapp_media_proxy'),
    path('simulate/', SimulateWhatsAppMessageView.as_view(), name='whatsapp_simulate'),
    path('start-chat/', StartWhatsAppChatView.as_view(), name='whatsapp_start_chat'),
    path('grabber-session/', GroupGrabberSessionView.as_view(), name='whatsapp_grabber_session'),
    path('inspect-group-invite/', InspectGroupInviteView.as_view(), name='inspect_group_invite'),
    path('', include(router.urls)),
]
