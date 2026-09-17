import time
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# In-memory session registry with TTL expiration (30 minutes)
# Format: { token: { 'status': 'pending'|'connected', 'device_name': str, 'phone': str, 'groups': list, 'updated_at': timestamp } }
_GRABBER_SESSIONS = {}
SESSION_TTL_SECONDS = 1800

def _cleanup_expired_sessions():
    now = time.time()
    expired = [t for t, s in _GRABBER_SESSIONS.items() if now - s.get('updated_at', 0) > SESSION_TTL_SECONDS]
    for t in expired:
        _GRABBER_SESSIONS.pop(t, None)

class GroupGrabberSessionView(APIView):
    """
    Handles real-time QR code session synchronization between mobile phone scanner
    and desktop Qiyam Business OS dashboard for WhatsApp group contact extraction.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        _cleanup_expired_sessions()
        token = request.query_params.get('token', '').strip()
        if not token:
            return Response({'success': False, 'error': 'Token parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        session = _GRABBER_SESSIONS.get(token)
        if not session:
            return Response({
                'success': True,
                'token': token,
                'status': 'unlinked',
                'connected': False,
                'device_name': None,
                'phone': None,
                'groups': []
            })

        return Response({
            'success': True,
            'token': token,
            'status': session.get('status', 'connected'),
            'connected': session.get('status') == 'connected',
            'device_name': session.get('device_name', 'Mobile WhatsApp Device'),
            'phone': session.get('phone', ''),
            'groups': session.get('groups', []),
            'updated_at': session.get('updated_at')
        })

    def post(self, request):
        _cleanup_expired_sessions()
        data = request.data
        token = data.get('token', '').strip()
        if not token:
            return Response({'success': False, 'error': 'Token parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        action = data.get('action', 'connect')
        device_name = data.get('device_name', 'Mobile Device')
        phone = data.get('phone', '')
        group_data = data.get('group_data') or data.get('groups')

        session = _GRABBER_SESSIONS.get(token, {
            'groups': []
        })

        if action == 'unlink':
            _GRABBER_SESSIONS.pop(token, None)
            return Response({'success': True, 'message': 'Session unlinked', 'token': token})

        session['status'] = 'connected'
        session['device_name'] = device_name
        session['phone'] = phone
        session['updated_at'] = time.time()

        if group_data:
            if isinstance(group_data, list):
                session['groups'] = group_data
            else:
                session['groups'].append(group_data)

        _GRABBER_SESSIONS[token] = session

        return Response({
            'success': True,
            'token': token,
            'status': 'connected',
            'device_name': session['device_name'],
            'phone': session['phone'],
            'groups_count': len(session['groups']),
            'message': 'Session updated successfully'
        })
