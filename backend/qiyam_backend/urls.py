from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from django.conf import settings
from django.conf.urls.static import static
from core.api_docs import api_root_view, swagger_ui_view, openapi_schema_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root_view, name='api_root'),
    path('api/docs/', swagger_ui_view, name='api_docs'),
    path('api/schema/', openapi_schema_view, name='api_schema'),
    path('swagger/', swagger_ui_view, name='swagger_ui'),
    path('docs/', swagger_ui_view, name='docs'),
    path('api/core/', include('core.urls')),
    path('api/conversations/', include('conversations.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/operations/', include('operations.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/automation/', include('automation.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/analytics/', include('analytics.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
