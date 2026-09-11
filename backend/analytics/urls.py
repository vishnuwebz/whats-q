from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChannelMetricViewSet, IntentMetricViewSet, DailyMetricViewSet

router = DefaultRouter()
router.register(r'channels', ChannelMetricViewSet)
router.register(r'intents', IntentMetricViewSet)
router.register(r'daily', DailyMetricViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
