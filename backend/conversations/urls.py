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
    CampaignMediaUploadView,
)
from .grabber_views import GroupGrabberSessionView
from .rcs_views import (
    RCSConfigView,
    RCSTestConnectionView,
    RCSCapabilityCheckView,
    RCSSendMessageView,
    RCSSimulateInboundView,
    RCSWebhookView,
)

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
    path('upload-campaign-media/', CampaignMediaUploadView.as_view(), name='upload_campaign_media'),
    path('simulate/', SimulateWhatsAppMessageView.as_view(), name='whatsapp_simulate'),
    path('start-chat/', StartWhatsAppChatView.as_view(), name='whatsapp_start_chat'),
    path('grabber-session/', GroupGrabberSessionView.as_view(), name='whatsapp_grabber_session'),
    path('inspect-group-invite/', InspectGroupInviteView.as_view(), name='inspect_group_invite'),
    # RCS Business Messaging (RBM) endpoints
    path('rcs/config/', RCSConfigView.as_view(), name='rcs_config'),
    path('rcs/test-connection/', RCSTestConnectionView.as_view(), name='rcs_test_connection'),
    path('rcs/check-capability/', RCSCapabilityCheckView.as_view(), name='rcs_check_capability'),
    path('rcs/send/', RCSSendMessageView.as_view(), name='rcs_send'),
    path('rcs/simulate/', RCSSimulateInboundView.as_view(), name='rcs_simulate'),
    path('rcs/webhook/', RCSWebhookView.as_view(), name='rcs_webhook'),
    path('', include(router.urls)),
]
