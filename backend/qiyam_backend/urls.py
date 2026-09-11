from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'name': 'Qiyam Business OS API',
        'version': '1.0.0',
        'status': 'healthy',
        'timestamp': '2026-09-01T15:40:00Z',
        'endpoints': {
            'core': '/api/core/',
            'conversations': '/api/conversations/',
            'whatsapp_webhook': '/api/conversations/webhook/',
            'whatsapp_simulate': '/api/conversations/simulate/',
            'crm': '/api/crm/',
            'operations': '/api/operations/',
            'finance': '/api/finance/',
            'automation': '/api/automation/',
            'ai': '/api/ai/',
            'analytics': '/api/analytics/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/core/', include('core.urls')),
    path('api/conversations/', include('conversations.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/operations/', include('operations.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/automation/', include('automation.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/analytics/', include('analytics.urls')),
]
