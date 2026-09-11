from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, DealViewSet, FollowUpViewSet, CustomerViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet)
router.register(r'deals', DealViewSet)
router.register(r'follow-ups', FollowUpViewSet)
router.register(r'customers', CustomerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
