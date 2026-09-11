from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkspaceViewSet, BranchViewSet, IntegrationViewSet, GlobalSearchView,
    SystemVersionView, SystemUpdateView
)

router = DefaultRouter()
router.register(r'workspace', WorkspaceViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'integrations', IntegrationViewSet)

urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global_search'),
    path('system-version/', SystemVersionView.as_view(), name='system_version'),
    path('system-update/', SystemUpdateView.as_view(), name='system_update'),
    path('', include(router.urls)),
]
