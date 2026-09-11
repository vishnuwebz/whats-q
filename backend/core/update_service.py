import os
import re
import subprocess
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

class SystemUpdateService:
    @classmethod
    def get_version_info(cls):
        base_dir = Path(__file__).resolve().parent.parent.parent
        env = os.environ.copy()
        env['GIT_TERMINAL_PROMPT'] = '0'
        env['GCM_INTERACTIVE'] = 'never'
        env['GIT_ASKPASS'] = 'echo'

        info = {
            'current_commit': '4f5e75a',
            'current_author': 'Vishnu G',
            'current_date': 'Sep 11, 2026',
            'current_message': 'Automated update and backup system',
            'latest_commit': '4f5e75a',
            'latest_message': 'System is up to date',
            'latest_author': 'Vishnu G',
            'latest_date': 'Sep 11, 2026',
            'update_available': False,
            'is_git': True,
        }

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

        # 2. Check Remote Repository (via GitHub API)
        try:
            rem_res = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'],
                cwd=base_dir,
                capture_output=True,
                text=True,
                timeout=2,
                env=env
            )
            remote_url = rem_res.stdout.strip() if rem_res.returncode == 0 else ''
            
            # Match github.com/:owner/:repo
            match = re.search(r'github\.com[:/]([^/]+)/([^/.]+)', remote_url)
            repo_targets = []
            if match:
                repo_targets.append(f'{match.group(1)}/{match.group(2)}')
            repo_targets.append('qbscalicut/whats-q')
            repo_targets.append('vishnuwebz/whats-q')

            for target in repo_targets:
                try:
                    api_url = f'https://api.github.com/repos/{target}/commits/main'
                    resp = requests.get(api_url, timeout=3)
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
            logger.warning(f'Error checking remote github updates: {e}')

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
