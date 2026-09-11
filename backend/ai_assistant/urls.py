from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KnowledgeArticleViewSet, AISettingsViewSet, AIChatView

router = DefaultRouter()
router.register(r'knowledge-base', KnowledgeArticleViewSet)
router.register(r'settings', AISettingsViewSet)

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai_chat'),
    path('', include(router.urls)),
]
