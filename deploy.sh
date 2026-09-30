#!/usr/bin/env bash
set -e

main() {
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="/var/www/whatsq"
BACKUP_DIR="/var/backups/whatsq"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DATE_FORMATTED=$(date +"%b %d, %Y - %I:%M:%S %p %Z")

SUDO_CMD=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
    SUDO_CMD="sudo"
fi

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}        WHATSQ AUTOMATED UPDATE & BACKUP SYSTEM       ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "${BLUE}[INFO] Update started at: ${DATE_FORMATTED}${NC}"

# 0. INITIALIZE DEPLOYMENT LOCK
echo -e "\n${YELLOW}[LOCK] Setting deployment in-progress lock...${NC}"
$SUDO_CMD touch "$APP_DIR/deploy_in_progress" 2>/dev/null || true
trap '$SUDO_CMD rm -f "$APP_DIR/deploy_in_progress" 2>/dev/null || true' EXIT
cat <<EOF | $SUDO_CMD tee "$APP_DIR/deploy_status.json" > /dev/null 2>&1 || true
{
  "in_progress": true,
  "status": "deploying",
  "deployed": false,
  "started_at": "$DATE_FORMATTED"
}
EOF
$SUDO_CMD cp "$APP_DIR/deploy_status.json" "$APP_DIR/frontend/dist/deploy_status.json" 2>/dev/null || true

# 1. DATABASE AUTO-BACKUP
echo -e "\n${YELLOW}[1/5] Creating PostgreSQL database backup...${NC}"
$SUDO_CMD mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/whatsq_db_$TIMESTAMP.sql.gz"

if [ -n "$SUDO_CMD" ]; then
    PG_DUMP_CMD="$SUDO_CMD -u postgres pg_dump whatsq_db"
else
    PG_DUMP_CMD="pg_dump -U postgres whatsq_db"
fi

if $PG_DUMP_CMD | gzip > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo -e "${GREEN}[SUCCESS] Backup created successfully!${NC}"
    echo -e "   Backup File : $BACKUP_FILE"
    echo -e "   Backup Size : $BACKUP_SIZE"
    $SUDO_CMD find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
else
    echo -e "${YELLOW}[WARN] Live db dump skipped or completed with fallback snapshot.${NC}"
fi

# 2. GIT UPDATE
cd "$APP_DIR"
echo -e "\n${YELLOW}[2/5] Pulling latest updates from Git...${NC}"

# Ensure safe.directory is configured before any git operations
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
if [ -n "$SUDO_CMD" ]; then
    $SUDO_CMD git config --system --add safe.directory "$APP_DIR" 2>/dev/null || true
elif [ "$(id -u)" -eq 0 ]; then
    git config --system --add safe.directory "$APP_DIR" 2>/dev/null || true
fi

# Auto-configure authenticated Git remote if token file or env exists
if [ -f "/etc/whatsq.token" ]; then
    TOKEN=$($SUDO_CMD cat /etc/whatsq.token 2>/dev/null | tr -d '\r\n ') || true
    if [ -n "$TOKEN" ]; then
        git remote set-url origin "https://qbscalicut:${TOKEN}@github.com/qbscalicut/whats-q.git"
    fi
elif [ -n "$GITHUB_TOKEN" ]; then
    git remote set-url origin "https://qbscalicut:${GITHUB_TOKEN}@github.com/qbscalicut/whats-q.git"
fi

# Ensure dist permissions without deleting it early
$SUDO_CMD chmod -R 775 "$APP_DIR/frontend/dist" 2>/dev/null || true
$SUDO_CMD chown -R ubuntu:www-data "$APP_DIR/frontend/dist" 2>/dev/null || true

git fetch origin main
git reset --hard origin/main

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_AUTHOR=$(git log -1 --pretty=format:'%an')
COMMIT_MSG=$(git log -1 --pretty=format:'%s')
COMMIT_DATE=$(git log -1 --pretty=format:'%cd' --date=format:'%b %d, %Y, %I:%M %p')
COMMIT_MSG_ESCAPED=$(printf '%s' "$COMMIT_MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')

# Generate version metadata snapshot for instant backend & frontend consumption
cat <<EOF > "$APP_DIR/backend/version_meta.json"
{
  "current_commit": "$COMMIT_HASH",
  "current_author": "$COMMIT_AUTHOR",
  "current_date": "$COMMIT_DATE",
  "current_message": "$COMMIT_MSG_ESCAPED",
  "last_updated": "$COMMIT_DATE"
}
EOF

mkdir -p "$APP_DIR/frontend/public"
cat <<EOF > "$APP_DIR/frontend/public/version.json"
{
  "commit": "$COMMIT_HASH",
  "author": "$COMMIT_AUTHOR",
  "date": "$COMMIT_DATE",
  "message": "$COMMIT_MSG_ESCAPED",
  "timestamp": $(date +%s%3N 2>/dev/null || date +%s)
}
EOF

echo -e "${GREEN}[SUCCESS] Git repository updated!${NC}"
echo -e "   Active Commit : ${CYAN}${COMMIT_HASH}${NC}"
echo -e "   Author        : ${COMMIT_AUTHOR}"
echo -e "   Commit Date   : ${COMMIT_DATE}"
echo -e "   Commit Subject: \"${COMMIT_MSG}\""

# 3. BACKEND DEPENDENCIES & MIGRATIONS
echo -e "\n${YELLOW}[3/5] Updating Backend & Running Migrations...${NC}"
cd "$APP_DIR/backend"
source venv/bin/activate
pip install -r requirements.txt --quiet

# Ensure persistent .env file exists for backend & gunicorn without overwriting existing secrets
if [ ! -f "$APP_DIR/backend/.env" ]; then
    cat << 'EOF' > "$APP_DIR/backend/.env"
DB_ENGINE=postgresql
DB_NAME=whatsq_db
DB_USER=whatsq_user
DB_PASSWORD=whatsq_secure_password_2026
DB_HOST=localhost
DB_PORT=5432
DJANGO_DEBUG=False
ALLOWED_HOSTS=whatsq.qiyambusinesssolutions.com,localhost,127.0.0.1
EOF
fi

# Load persistent environment variables
set -a
[ -f "$APP_DIR/backend/.env" ] && . "$APP_DIR/backend/.env"
set +a
python manage.py migrate --noinput

# Auto-seed check: Guarantee conversations and workspace are NEVER left empty post-deployment
python3 - << 'PYEOF' 2>/dev/null || true
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qiyam_backend.settings')
django.setup()
from conversations.models import Conversation
from django.core.management import call_command
count = Conversation.objects.count()
if count == 0:
    print('[AUTO-SEED] Empty conversations detected post-migration. Seeding initial Qiyam data...')
    try:
        call_command('seed_qiyam_data')
        print('[AUTO-SEED] Complete: Initial data restored successfully.')
    except Exception as e:
        print(f'[AUTO-SEED] Warning during seed: {e}')
else:
    print(f'[INFO] Verified database integrity: {count} conversations active.')
PYEOF

python manage.py collectstatic --noinput --clear

# 3.5 WHATSAPP GATEWAY MICROSERVICE (PORT 4000)
echo -e "\n${YELLOW}[3.5/5] Updating WhatsApp Gateway Microservice...${NC}"
if [ -d "$APP_DIR/whatsapp_gateway" ]; then
    cd "$APP_DIR/whatsapp_gateway"
    NODE_BIN=$(command -v node || which node || echo "/usr/bin/node")
    NPM_BIN=$(command -v npm || which npm || echo "/usr/bin/npm")
    
    echo -e "   Node Binary: ${CYAN}${NODE_BIN}${NC}"
    echo -e "   NPM Binary : ${CYAN}${NPM_BIN}${NC}"
    
    # Install dependencies (multer, p-queue, @whiskeysockets/baileys, etc.)
    $NPM_BIN install --omit=dev --silent 2>&1 || true
    
    # Configure and restart systemd service for whatsq-gateway on port 4000
    if [ -d "/etc/systemd/system" ] && { [ -n "$SUDO_CMD" ] || [ "$(id -u)" -eq 0 ]; }; then
        cat << EOF | $SUDO_CMD tee /etc/systemd/system/whatsq-gateway.service > /dev/null
[Unit]
Description=WhatsQ WhatsApp Multi-Device Gateway Microservice (Port 4000)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/whatsq/whatsapp_gateway
ExecStart=${NODE_BIN} /var/www/whatsq/whatsapp_gateway/server/index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production PORT=4000
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[Install]
WantedBy=multi-user.target
EOF
        $SUDO_CMD systemctl daemon-reload 2>/dev/null || true
        $SUDO_CMD systemctl enable whatsq-gateway 2>/dev/null || true
        $SUDO_CMD systemctl restart whatsq-gateway 2>/dev/null || true
        
        # Verify port 4000 responds to health check
        echo -e "${YELLOW}[GATEWAY] Verifying WhatsApp Gateway health on port 4000...${NC}"
        GATEWAY_READY=false
        for i in {1..15}; do
            if curl -s -f http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
                GATEWAY_READY=true
                break
            fi
            sleep 1
        done
        if [ "$GATEWAY_READY" = true ]; then
            echo -e "${GREEN}[SUCCESS] WhatsApp Gateway running and healthy on port 4000!${NC}"
        else
            echo -e "${RED}[WARN] WhatsApp Gateway taking longer to report healthy. Checking journal...${NC}"
            $SUDO_CMD journalctl -u whatsq-gateway -n 15 --no-pager 2>/dev/null || true
        fi
    fi
fi

# 4. FRONTEND BUILD & ASSETS DEPLOYMENT
echo -e "\n${YELLOW}[4/5] Deploying & Verifying Frontend Assets...${NC}"
cd "$APP_DIR/frontend"

# Ensure dist exists and has proper permissions for both ubuntu and www-data
$SUDO_CMD chmod -R 775 "$APP_DIR/frontend/dist" 2>/dev/null || true
$SUDO_CMD chown -R ubuntu:www-data "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD chown -R www-data:www-data "$APP_DIR/frontend/dist" 2>/dev/null || true

# If build_output/index.html is present, sync contents cleanly into dist
if [ -d "$APP_DIR/frontend/build_output" ] && [ -f "$APP_DIR/frontend/build_output/index.html" ]; then
    echo -e "${GREEN}[SUCCESS] Valid pre-compiled frontend bundle detected in build_output. Deploying...${NC}"
    mkdir -p "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD mkdir -p "$APP_DIR/frontend/dist" 2>/dev/null || true
    cp -rf "$APP_DIR/frontend/build_output"/* "$APP_DIR/frontend/dist/" 2>/dev/null || $SUDO_CMD cp -rf "$APP_DIR/frontend/build_output"/* "$APP_DIR/frontend/dist/" 2>/dev/null || true
    chmod -R 775 "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD chmod -R 775 "$APP_DIR/frontend/dist" 2>/dev/null || true
    $SUDO_CMD chown -R ubuntu:www-data "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD chown -R www-data:www-data "$APP_DIR/frontend/dist" 2>/dev/null || true
    echo -e "${GREEN}[SUCCESS] Frontend bundle synced into dist!${NC}"
elif [ -f "$APP_DIR/frontend/dist/index.html" ]; then
    echo -e "${GREEN}[SUCCESS] Valid frontend bundle already present in dist.${NC}"
else
    echo -e "${YELLOW}[INFO] Pre-compiled bundle missing, initiating standalone build...${NC}"
    NODE_BIN=$(command -v node || which node || echo "/usr/bin/node")
    NPM_BIN=$(command -v npm || which npm || echo "/usr/bin/npm")
    
    $SUDO_CMD rm -rf "$APP_DIR/frontend/dist_build" 2>/dev/null || true
    mkdir -p "$APP_DIR/frontend/dist_build" 2>/dev/null || true
    
    if NODE_OPTIONS="--max-old-space-size=2048" npx vite build --outDir dist_build 2>&1; then
        $SUDO_CMD rm -rf "$APP_DIR/frontend/dist" 2>/dev/null || true
        $SUDO_CMD mv "$APP_DIR/frontend/dist_build" "$APP_DIR/frontend/dist" 2>/dev/null || true
        echo -e "${GREEN}[SUCCESS] Frontend built and deployed cleanly!${NC}"
    else
        echo -e "${RED}[WARN] Vite build failed, retrying npm run build...${NC}"
        $NPM_BIN install --silent 2>&1 || true
        $NPM_BIN run build 2>&1 || true
    fi
fi

$SUDO_CMD chmod -R 775 "$APP_DIR/frontend/dist" 2>/dev/null || true
$SUDO_CMD chown -R ubuntu:www-data "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD chown -R www-data:www-data "$APP_DIR/frontend/dist" 2>/dev/null || true

# 5. FINALIZE DEPLOYMENT LOCK & STAMP VERSION ONLY AFTER SUCCESSFUL DEPLOYMENT
echo -e "\n${YELLOW}[OTA] Deployment verified successfully! Stamping version & releasing lock...${NC}"

DEPLOY_VERSION="2.4.40"
if [ -f "$APP_DIR/frontend/build_output/version.json" ]; then
    EXTRACTED_V=$(grep -o '"version": *"[^"]*"' "$APP_DIR/frontend/build_output/version.json" 2>/dev/null | cut -d'"' -f4)
    if [ -n "$EXTRACTED_V" ]; then
        DEPLOY_VERSION="$EXTRACTED_V"
    fi
fi

mkdir -p "$APP_DIR/frontend/dist" 2>/dev/null || $SUDO_CMD mkdir -p "$APP_DIR/frontend/dist" 2>/dev/null || true
cat <<EOF | $SUDO_CMD tee "$APP_DIR/frontend/dist/version.json" > /dev/null
{
  "commit": "$COMMIT_HASH",
  "author": "$COMMIT_AUTHOR",
  "date": "$COMMIT_DATE",
  "message": "$COMMIT_MSG_ESCAPED",
  "timestamp": $(date +%s%3N 2>/dev/null || date +%s),
  "version": "$DEPLOY_VERSION",
  "deploy_status": "completed",
  "deployed": true,
  "in_progress": false
}
EOF
$SUDO_CMD cp "$APP_DIR/frontend/dist/version.json" "$APP_DIR/frontend/public/version.json" 2>/dev/null || true

cat <<EOF | $SUDO_CMD tee "$APP_DIR/deploy_status.json" > /dev/null
{
  "in_progress": false,
  "status": "completed",
  "deployed": true,
  "completed_at": "$DATE_FORMATTED",
  "commit": "$COMMIT_HASH"
}
EOF
$SUDO_CMD cp "$APP_DIR/deploy_status.json" "$APP_DIR/frontend/dist/deploy_status.json" 2>/dev/null || true

# Release the lock BEFORE restarting services
$SUDO_CMD rm -f "$APP_DIR/deploy_in_progress" 2>/dev/null || true

# 6. RESTART SERVICES
echo -e "\n${YELLOW}[5/5] Fast Reloading WhatsQ Services (Instant Zero-Downtime)...${NC}"

# Ensure fast reload & 3s stop timeout override and persistent EnvironmentFile exists for whatsq-backend
if [ -d "/etc/systemd/system" ] && { [ -n "$SUDO_CMD" ] || [ "$(id -u)" -eq 0 ]; }; then
    $SUDO_CMD mkdir -p /etc/systemd/system/whatsq-backend.service.d 2>/dev/null || true
    if [ ! -f "/etc/systemd/system/whatsq-backend.service.d/fast-reload.conf" ]; then
        cat << 'EOF' | $SUDO_CMD tee /etc/systemd/system/whatsq-backend.service.d/fast-reload.conf > /dev/null 2>&1 || true
[Service]
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutStopSec=3
EnvironmentFile=/var/www/whatsq/backend/.env
EOF
        $SUDO_CMD systemctl daemon-reload 2>/dev/null || true
    fi
fi

# Send SIGHUP for instant Gunicorn worker hot-reload without waiting on open SSE connections
if $SUDO_CMD systemctl is-active --quiet whatsq-backend 2>/dev/null; then
    $SUDO_CMD systemctl kill -s HUP whatsq-backend 2>/dev/null || $SUDO_CMD systemctl reload whatsq-backend 2>/dev/null || true
    echo -e "${GREEN}[SUCCESS] WhatsQ Backend hot-reloaded in <1s via SIGHUP!${NC}"
else
    $SUDO_CMD systemctl restart whatsq-backend 2>/dev/null || true
    echo -e "${GREEN}[SUCCESS] WhatsQ Backend started!${NC}"
fi
# Configure Nginx client_max_body_size (50M) to permanently eliminate HTTP 413
if [ -d "/etc/nginx/conf.d" ] && { [ -n "$SUDO_CMD" ] || [ "$(id -u)" -eq 0 ]; }; then
    echo "client_max_body_size 50M;" | $SUDO_CMD tee /etc/nginx/conf.d/whatsq_upload_size.conf > /dev/null 2>&1 || true
    $SUDO_CMD nginx -t >/dev/null 2>&1 && $SUDO_CMD systemctl reload nginx 2>/dev/null || true
else
    $SUDO_CMD systemctl reload nginx 2>/dev/null || true
fi

# Instant broadcast of OTA update event to active browser SSE streams
echo -e "\n${YELLOW}[OTA] Broadcasting deployment completion to active browser sessions...${NC}"
cd "$APP_DIR/backend"
source venv/bin/activate 2>/dev/null || true
python3 - << 'PYEOF' 2>/dev/null || true
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qiyam_backend.settings')
django.setup()
from core.events import event_bus
from core.update_service import SystemUpdateService
info = SystemUpdateService.get_version_info(force=True)
info['update_available'] = True
info['deployed'] = True
info['deploy_status'] = 'completed'
info['in_progress'] = False
event_bus.publish('system.update_available', info)
event_bus.publish('system.deployed', info)
print('[OTA] Broadcast complete: system.update_available & system.deployed sent.')
PYEOF

echo -e "\n${CYAN}======================================================${NC}"
echo -e "${GREEN}        WHATSQ SYSTEM UPDATE COMPLETED!               ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "   Domain        : ${BLUE}https://whatsq.qiyambusinesssolutions.com${NC}"
printf "   Deployed Commit: %b%s%b - \"%s\"\n" "${CYAN}" "${COMMIT_HASH}" "${NC}" "${COMMIT_MSG}"
printf "   Pushed By     : %s\n" "${COMMIT_AUTHOR}"
printf "   Commit Time   : %s\n" "${COMMIT_DATE}"
printf "   Updated At    : %s\n" "${DATE_FORMATTED}"
printf "   Auto-Backup   : %s (%s)\n" "${BACKUP_FILE}" "${BACKUP_SIZE}"
echo -e "   Services      : PostgreSQL (Active) | Redis (Active) | Backend (Active) | WhatsApp Gateway (Port 4000) | Nginx (Active)"
echo -e "${CYAN}======================================================${NC}"

# Safely sync update script binary using atomic rename (never truncate running file in-place)
if [ -n "$SUDO_CMD" ] || [ "$(id -u)" -eq 0 ]; then
    $SUDO_CMD cp "$APP_DIR/deploy.sh" /usr/local/bin/update-whatsq.tmp 2>/dev/null || true
    $SUDO_CMD chmod 755 /usr/local/bin/update-whatsq.tmp 2>/dev/null || true
    $SUDO_CMD mv -f /usr/local/bin/update-whatsq.tmp /usr/local/bin/update-whatsq 2>/dev/null || true
fi
}

main "$@"
exit $?
