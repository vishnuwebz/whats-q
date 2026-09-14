import re
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

# High-risk attack regex patterns for SQL Injection & XSS detection
SQLI_PATTERNS = [
    re.compile(r"(\bUNION\b\s+\bSELECT\b)", re.IGNORECASE),
    re.compile(r"(\bDROP\b\s+\bTABLE\b)", re.IGNORECASE),
    re.compile(r"(\bINFORMATION_SCHEMA\b)", re.IGNORECASE),
    re.compile(r"(;\s*\bSHUTDOWN\b)", re.IGNORECASE),
    re.compile(r"('\s*OR\s+'1'\s*=\s*'1)", re.IGNORECASE),
    re.compile(r"(\bBENCHMARK\s*\(\s*\d+)", re.IGNORECASE),
    re.compile(r"(\bWAITFOR\s+DELAY\b)", re.IGNORECASE),
]

XSS_PATTERNS = [
    re.compile(r"<\s*script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"onerror\s*=", re.IGNORECASE),
    re.compile(r"onload\s*=", re.IGNORECASE),
    re.compile(r"<\s*iframe[^>]*>", re.IGNORECASE),
]

PATH_TRAVERSAL_PATTERN = re.compile(r"(\.\./|\.\.\\)", re.IGNORECASE)

class SecuritySanitizationMiddleware(MiddlewareMixin):
    """
    Enterprise-Grade Security & Sanitization Middleware.
    - Inspects incoming requests for malicious SQL injection, XSS, and path traversal vectors.
    - Enforces bank-grade response security headers (HSTS, nosniff, frame denial).
    - Prevents data leakage and unauthorized probe exploitation.
    """

    def process_request(self, request):
        # Exclude static files and admin from payload inspection
        path = request.path_info
        if path.startswith('/static/') or path.startswith('/admin/'):
            return None

        # 1. Path traversal inspection
        if PATH_TRAVERSAL_PATTERN.search(path):
            logger.warning(f"[SECURITY ALERT] Path traversal attempt detected from {self._get_client_ip(request)} on {path}")
            return JsonResponse({
                'error': 'Access denied: Malformed request path detected.'
            }, status=400)

        # 2. Inspect query parameters
        for key, value in request.GET.items():
            if self._is_malicious_string(value):
                logger.warning(f"[SECURITY ALERT] Malicious query parameter detected in '{key}' from {self._get_client_ip(request)}")
                return JsonResponse({
                    'error': 'Security Violation: Unsafe input pattern detected.'
                }, status=400)

        return None

    def process_response(self, request, response):
        """
        Enforce enterprise hardening response headers.
        """
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        
        # In production HTTPS, enforce HSTS
        if not request.is_secure() and 'localhost' not in request.get_host():
            # If forwarded by proxy with https
            if request.headers.get('X-Forwarded-Proto') == 'https':
                response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        elif request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        return response

    def _is_malicious_string(self, text: str) -> bool:
        if not text or not isinstance(text, str):
            return False
        for p in SQLI_PATTERNS:
            if p.search(text):
                return True
        for p in XSS_PATTERNS:
            if p.search(text):
                return True
        return False

    def _get_client_ip(self, request) -> str:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
