from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceViewSet, BranchViewSet, IntegrationViewSet

router = DefaultRouter()
router.register(r'workspace', WorkspaceViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'integrations', IntegrationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
