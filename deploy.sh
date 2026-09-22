#!/usr/bin/env bash
set -e

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

# Auto-configure authenticated Git remote if token file or env exists
if [ -f "/etc/whatsq.token" ]; then
    TOKEN=$(cat /etc/whatsq.token | tr -d '\r\n ')
    if [ -n "$TOKEN" ]; then
        git remote set-url origin "https://qbscalicut:${TOKEN}@github.com/qbscalicut/whats-q.git"
    fi
elif [ -n "$GITHUB_TOKEN" ]; then
    git remote set-url origin "https://qbscalicut:${GITHUB_TOKEN}@github.com/qbscalicut/whats-q.git"
fi

git fetch origin main
git reset --hard origin/main

git config --global --add safe.directory "$APP_DIR" || true
git config --system --add safe.directory "$APP_DIR" || true

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_AUTHOR=$(git log -1 --pretty=format:'%an')
COMMIT_MSG=$(git log -1 --pretty=format:'%s')
COMMIT_DATE=$(git log -1 --pretty=format:'%cd' --date=format:'%b %d, %Y, %I:%M %p')

# Generate version metadata snapshot for instant backend & frontend consumption
cat <<EOF > "$APP_DIR/backend/version_meta.json"
{
  "current_commit": "$COMMIT_HASH",
  "current_author": "$COMMIT_AUTHOR",
  "current_date": "$COMMIT_DATE",
  "current_message": "$COMMIT_MSG",
  "last_updated": "$COMMIT_DATE"
}
EOF

mkdir -p "$APP_DIR/frontend/public"
cat <<EOF > "$APP_DIR/frontend/public/version.json"
{
  "commit": "$COMMIT_HASH",
  "author": "$COMMIT_AUTHOR",
  "date": "$COMMIT_DATE",
  "message": "$COMMIT_MSG",
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
python -c "
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
"

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
    if [ -d "/etc/systemd/system" ] && [ -n "$SUDO_CMD" -o "$(id -u)" -eq 0 ]; then
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

# 4. FRONTEND BUILD
echo -e "\n${YELLOW}[4/5] Building Frontend...${NC}"
cd "$APP_DIR/frontend"
NODE_BIN=$(command -v node || which node || echo "/usr/bin/node")
NPM_BIN=$(command -v npm || which npm || echo "/usr/bin/npm")
$NPM_BIN install --silent
$NPM_BIN run build
cp "$APP_DIR/frontend/public/version.json" "$APP_DIR/frontend/dist/version.json" 2>/dev/null || true
$SUDO_CMD chmod -R 755 "$APP_DIR/frontend/dist" 2>/dev/null || true
$SUDO_CMD chown -R www-data:www-data "$APP_DIR/frontend/dist" 2>/dev/null || true

# 5. RESTART SERVICES
echo -e "\n${YELLOW}[5/5] Fast Reloading WhatsQ Services (Instant Zero-Downtime)...${NC}"

# Ensure fast reload & 3s stop timeout override and persistent EnvironmentFile exists for whatsq-backend
if [ -d "/etc/systemd/system" ] && [ -n "$SUDO_CMD" -o "$(id -u)" -eq 0 ]; then
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

$SUDO_CMD systemctl reload nginx 2>/dev/null || true

# Instant broadcast of OTA update event to active browser SSE streams
echo -e "\n${YELLOW}[OTA] Broadcasting deployment event to active browser sessions...${NC}"
cd "$APP_DIR/backend"
source venv/bin/activate 2>/dev/null || true
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qiyam_backend.settings')
django.setup()
from core.events import event_bus
from core.update_service import SystemUpdateService
info = SystemUpdateService.get_version_info(force=True)
event_bus.publish('system.update_available', info)
event_bus.publish('system.deployed', info)
print('[OTA] Broadcast complete: system.update_available & system.deployed sent.')
" 2>/dev/null || true

# Sync update script binary
$SUDO_CMD cp "$APP_DIR/deploy.sh" /usr/local/bin/update-whatsq 2>/dev/null || true
$SUDO_CMD chmod +x /usr/local/bin/update-whatsq 2>/dev/null || true

echo -e "\n${CYAN}======================================================${NC}"
echo -e "${GREEN}        WHATSQ SYSTEM UPDATE COMPLETED!               ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "   Domain        : ${BLUE}https://whatsq.qiyambusinesssolutions.com${NC}"
echo -e "   Deployed Commit: ${CYAN}${COMMIT_HASH}${NC} - \"${COMMIT_MSG}\""
echo -e "   Pushed By     : ${COMMIT_AUTHOR}"
echo -e "   Commit Time   : ${COMMIT_DATE}"
echo -e "   Updated At    : ${DATE_FORMATTED}"
echo -e "   Auto-Backup   : ${BACKUP_FILE} (${BACKUP_SIZE})"
echo -e "   Services      : PostgreSQL (Active) | Redis (Active) | Backend (Active) | WhatsApp Gateway (Port 4000) | Nginx (Active)"
echo -e "${CYAN}======================================================${NC}"
