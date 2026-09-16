from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkspaceViewSet, BranchViewSet, IntegrationViewSet, GlobalSearchView,
    SystemVersionView, SystemUpdateView, SystemUpdateBroadcastView,
    EventStreamView, EventSyncView,
    BackupStatusView, BackupExportView, BackupImportView,
    AutoBackupTriggerView, BackupSnapshotsView
)

router = DefaultRouter()
router.register(r'workspace', WorkspaceViewSet)
router.register(r'branches', BranchViewSet)
router.register(r'integrations', IntegrationViewSet)

urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global_search'),
    path('system-version/', SystemVersionView.as_view(), name='system_version'),
    path('system-update/', SystemUpdateView.as_view(), name='system_update'),
    path('system-update/broadcast/', SystemUpdateBroadcastView.as_view(), name='system_update_broadcast'),
    path('events/stream/', EventStreamView.as_view(), name='events_stream'),
    path('events/sync/', EventSyncView.as_view(), name='events_sync'),
    # Database Backup & Restore Endpoints
    path('backup/status/', BackupStatusView.as_view(), name='backup_status'),
    path('backup/export/', BackupExportView.as_view(), name='backup_export'),
    path('backup/import/', BackupImportView.as_view(), name='backup_import'),
    path('backup/auto-backup/', AutoBackupTriggerView.as_view(), name='backup_auto'),
    path('backup/snapshots/', BackupSnapshotsView.as_view(), name='backup_snapshots'),
    path('', include(router.urls)),
]
