import json
import logging
import time
import urllib.error
import urllib.request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

BAILEYS_GATEWAY_URL = 'http://127.0.0.1:4000'

def _call_baileys_gateway(endpoint, method='GET', data=None, timeout=1.5):
    try:
        url = f"{BAILEYS_GATEWAY_URL}{endpoint}"
        encoded = json.dumps(data).encode('utf-8') if data is not None else None
        req = urllib.request.Request(url, data=encoded, method=method)
        req.add_header('Content-Type', 'application/json')
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        return {'success': False, 'error': str(e)}

# In-memory session registry with TTL expiration (30 minutes)
# Format: { token: { 'status': 'pending'|'connected', 'device_name': str, 'phone': str, 'groups': list, 'updated_at': timestamp } }
_GRABBER_SESSIONS = {}
SESSION_TTL_SECONDS = 1800

def _cleanup_expired_sessions():
    now = time.time()
    expired = [t for t, s in _GRABBER_SESSIONS.items() if now - s.get('updated_at', 0) > SESSION_TTL_SECONDS]
    for t in expired:
        _GRABBER_SESSIONS.pop(t, None)

def link_grabber_session(token: str, phone: str = '', device_name: str = 'Mobile WhatsApp Device', groups: list = None) -> bool:
    """
    Direct helper to link a group grabber session token, used by Meta Webhook or API handlers
    when user scans the WhatsApp QR code and sends the SYNC message to the verified line.
    """
    _cleanup_expired_sessions()
    if not token:
        return False
    session = _GRABBER_SESSIONS.get(token, {
        'groups': []
    })
    session['status'] = 'connected'
    session['device_name'] = device_name or 'Mobile WhatsApp Device'
    session['phone'] = phone or session.get('phone', '')
    session['updated_at'] = time.time()
    if groups:
        if isinstance(groups, list):
            session['groups'] = groups
        else:
            session['groups'].append(groups)
    _GRABBER_SESSIONS[token] = session
    logger.info(f"[Group Grabber] Session '{token}' linked successfully via WhatsApp QR sync from {phone}")
    return True

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

        # Check live Baileys Gateway state on port 4000
        qr_info = _call_baileys_gateway(f'/api/accounts/qr/{token}', method='GET')
        gw_status = qr_info.get('status', '')
        live_qr = qr_info.get('qrCode')

        # 1. If live gateway explicitly reports disconnected:
        if gw_status == 'disconnected':
            _GRABBER_SESSIONS.pop(token, None)
            return Response({
                'success': True,
                'token': token,
                'status': 'disconnected',
                'connected': False,
                'qrCode': None,
                'device_name': None,
                'phone': None,
                'groups': []
            })

        # 2. Check if THIS specific token is genuinely authenticated and online on Baileys gateway
        accs_res = _call_baileys_gateway('/api/accounts', method='GET')
        all_accs = accs_res.get('accounts', []) if isinstance(accs_res, dict) else []
        matching_acc = next((a for a in all_accs if a.get('id') == token), None)

        # A session is ONLY online if THIS session token was physically scanned by the user's phone
        is_token_online = (gw_status == 'online') or (matching_acc and matching_acc.get('status') == 'online')

        if is_token_online:
            detected_phone = (matching_acc.get('phoneNumber') if matching_acc else '') or qr_info.get('phoneNumber') or ''
            label = (matching_acc.get('displayName') if matching_acc else '') or 'WhatsApp Linked Device'

            session = _GRABBER_SESSIONS.get(token, {'groups': []})
            session['status'] = 'connected'
            session['phone'] = detected_phone
            session['device_name'] = label
            session['updated_at'] = time.time()

            # Fetch real participating WhatsApp groups with member rosters from phone via Baileys socket
            if not session.get('groups'):
                gw_groups = _call_baileys_gateway(f'/api/accounts/{token}/groups', method='GET')
                if not gw_groups.get('success'):
                    gw_groups = _call_baileys_gateway('/api/groups', method='GET')
                if gw_groups.get('success') and gw_groups.get('groups'):
                    session['groups'] = gw_groups.get('groups')

            _GRABBER_SESSIONS[token] = session

            return Response({
                'success': True,
                'token': token,
                'status': 'connected',
                'connected': True,
                'device_name': label,
                'phone': detected_phone,
                'groups': session.get('groups', []),
                'updated_at': session.get('updated_at')
            })

        # 3. If token is not authenticated, strictly report unlinked / pairing with QR code (never fake connect)
        _GRABBER_SESSIONS.pop(token, None)
        return Response({
            'success': True,
            'token': token,
            'status': gw_status or 'unlinked',
            'connected': False,
            'qrCode': live_qr,
            'device_name': None,
            'phone': None,
            'groups': []
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

        if action in ['baileys_session', 'start_session']:
            # Starts authentic WhatsApp Web socket session on port 4000
            pair_res = _call_baileys_gateway('/api/accounts/pair', method='POST', data={
                'id': token,
                'displayName': device_name or 'QR Group Grabber'
            }, timeout=3.5)
            qr_code = pair_res.get('qrCode')
            pair_status = pair_res.get('status') or 'pairing'
            if not qr_code:
                qr_res = _call_baileys_gateway(f'/api/accounts/qr/{token}', method='GET', timeout=1.0)
                qr_code = qr_res.get('qrCode')
                pair_status = qr_res.get('status', pair_status)

            return Response({
                'success': True,
                'token': token,
                'status': pair_status,
                'qrCode': qr_code,
            })

        session = _GRABBER_SESSIONS.get(token, {
            'groups': []
        })

        if action in ['fetch_live_groups', 'refresh_groups']:
            gw_groups = _call_baileys_gateway(f'/api/accounts/{token}/groups', method='GET')
            if not gw_groups.get('success'):
                gw_groups = _call_baileys_gateway('/api/groups', method='GET')
            groups = gw_groups.get('groups', [])
            session = _GRABBER_SESSIONS.get(token, {'groups': []})
            if groups:
                session['groups'] = groups
            session['updated_at'] = time.time()
            _GRABBER_SESSIONS[token] = session
            return Response({
                'success': True,
                'count': len(session.get('groups', [])),
                'groups': session.get('groups', []),
                'error': gw_groups.get('error') if not gw_groups.get('success') else None,
            })

        if action in ['fetch_group_details', 'inspect_group']:
            group_jid = data.get('group_jid', '')
            gw_res = _call_baileys_gateway(f'/api/groups/{group_jid}', method='GET', timeout=15)
            return Response(gw_res)

        if action in ['unlink', 'disconnect']:
            # Dispatch logout request to Baileys gateway so WhatsApp phone drops companion device
            _call_baileys_gateway(f'/api/accounts/{token}/disconnect', method='POST')
            _call_baileys_gateway('/api/disconnect', method='POST', data={'id': token, 'phone': phone})
            _GRABBER_SESSIONS.pop(token, None)
            return Response({
                'success': True,
                'status': 'disconnected',
                'connected': False,
                'message': 'Session unlinked and logged out from WhatsApp',
                'token': token
            })

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
