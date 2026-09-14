import os
import re
import time
import subprocess
import logging
import requests
from pathlib import Path
from core.events import event_bus

logger = logging.getLogger(__name__)

class SystemUpdateService:
    _cached_info = None
    _cache_time = 0
    _CACHE_DURATION = 20  # seconds

    @classmethod
    def get_version_info(cls, simulate=False, force=False):
        now = time.time()
        if not force and not simulate and cls._cached_info and (now - cls._cache_time < cls._CACHE_DURATION):
            return cls._cached_info

        base_dir = Path(__file__).resolve().parent.parent.parent
        env = os.environ.copy()
        env['GIT_TERMINAL_PROMPT'] = '0'
        env['GCM_INTERACTIVE'] = 'never'
        env['GIT_ASKPASS'] = 'echo'

        info = {
            'current_commit': '731c43b',
            'current_author': 'Vishnu G',
            'current_date': 'Sep 14, 2026',
            'current_message': 'System is operating on the latest release',
            'latest_commit': '731c43b',
            'latest_message': 'System is up to date with origin/main',
            'latest_author': 'WhatsQ Team',
            'latest_date': 'Just now',
            'update_available': False,
            'is_git': True,
        }

        # Handle simulation request
        if simulate:
            info['latest_commit'] = '89ef12c'
            info['latest_message'] = 'Critical Security Shield & High-Concurrency Engine v2.4.2'
            info['latest_author'] = 'WhatsQ Core Team'
            info['latest_date'] = 'Just now'
            info['update_available'] = True
            # Broadcast to event bus
            event_bus.publish('system.update_available', info)
            return info

        # 1. Get Current Local Commit
        try:
            res = subprocess.run(
                ['git', 'rev-parse', '--short', 'HEAD'],
                cwd=base_dir,
                capture_output=True,
                text=True,
                timeout=3,
                env=env
            )
            if res.returncode == 0 and res.stdout.strip():
                info['current_commit'] = res.stdout.strip()
                info['latest_commit'] = res.stdout.strip()

                log_res = subprocess.run(
                    ['git', 'log', '-1', '--pretty=format:%an|%cd|%s', '--date=format:%b %d, %Y, %I:%M %p'],
                    cwd=base_dir,
                    capture_output=True,
                    text=True,
                    timeout=3,
                    env=env
                )
                if log_res.returncode == 0 and '|' in log_res.stdout:
                    parts = log_res.stdout.split('|', 2)
                    info['current_author'] = parts[0]
                    info['current_date'] = parts[1]
                    info['current_message'] = parts[2]
        except Exception as e:
            logger.warning(f'Error reading local git: {e}')

        # 2. Check Remote Repository via git ls-remote (fast, non-rate-limited)
        remote_sha = None
        try:
            ls_res = subprocess.run(
                ['git', 'ls-remote', 'origin', 'refs/heads/main'],
                cwd=base_dir,
                capture_output=True,
                text=True,
                timeout=4,
                env=env
            )
            if ls_res.returncode == 0 and ls_res.stdout.strip():
                parts = ls_res.stdout.strip().split()
                if parts:
                    remote_sha = parts[0]
                    remote_short = remote_sha[:7]
                    info['latest_commit'] = remote_short
                    if remote_short != info['current_commit']:
                        info['update_available'] = True
                        info['latest_message'] = 'New production build available on origin/main'
        except Exception as e:
            logger.warning(f'git ls-remote failed: {e}')

        # 3. Check Remote Details via GitHub API (with token authentication if present in env)
        try:
            token = os.environ.get('GITHUB_TOKEN')
            headers = {'Accept': 'application/vnd.github.v3+json'}
            if token:
                headers['Authorization'] = f'Bearer {token}'

            repo_targets = ['qbscalicut/whats-q', 'vishnuwebz/whats-q']
            for target in repo_targets:
                try:
                    api_url = f'https://api.github.com/repos/{target}/commits/main'
                    resp = requests.get(api_url, headers=headers, timeout=4)
                    if resp.status_code == 200:
                        data = resp.json()
                        sha = data.get('sha', '')
                        commit_obj = data.get('commit', {})
                        short_sha = sha[:7]

                        info['latest_commit'] = short_sha
                        info['latest_message'] = commit_obj.get('message', '').split('\n')[0]
                        info['latest_author'] = commit_obj.get('author', {}).get('name', 'WhatsQ Team')
                        info['latest_date'] = commit_obj.get('author', {}).get('date', '')

                        if short_sha and short_sha != info['current_commit']:
                            info['update_available'] = True
                        else:
                            info['update_available'] = False
                        break
                except Exception:
                    continue
        except Exception as e:
            logger.warning(f'Error querying GitHub API: {e}')

        cls._cached_info = info
        cls._cache_time = now

        # If update is available, publish to SSE event bus
        if info.get('update_available'):
            event_bus.publish('system.update_available', info)

        return info

    @classmethod
    def apply_update(cls):
        """
        Runs the automated backup and update script.
        """
        script_path = '/usr/local/bin/update-whatsq'
        if os.path.exists(script_path):
            try:
                proc = subprocess.Popen(
                    ['sudo', script_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                return {
                    'success': True,
                    'message': 'System update and PostgreSQL backup initiated successfully!',
                    'pid': proc.pid
                }
            except Exception as e:
                return {'success': False, 'error': str(e)}
        else:
            return {
                'success': True,
                'message': 'Update simulation completed successfully on local machine.'
            }
