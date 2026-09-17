from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationViewSet,
    MessageViewSet,
    WhatsAppTemplateViewSet,
    MetaConfigViewSet,
    WhatsAppWebhookView,
    SimulateWhatsAppMessageView
)
from .grabber_views import GroupGrabberSessionView

router = DefaultRouter()
router.register(r'threads', ConversationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'templates', WhatsAppTemplateViewSet)
router.register(r'meta-config', MetaConfigViewSet, basename='meta-config')

urlpatterns = [
    path('webhook/', WhatsAppWebhookView.as_view(), name='whatsapp_webhook'),
    path('simulate/', SimulateWhatsAppMessageView.as_view(), name='whatsapp_simulate'),
    path('grabber-session/', GroupGrabberSessionView.as_view(), name='whatsapp_grabber_session'),
    path('', include(router.urls)),
]
