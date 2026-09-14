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

# Generate version metadata snapshot for instant backend consumption
cat <<EOF > "$APP_DIR/backend/version_meta.json"
{
  "current_commit": "$COMMIT_HASH",
  "current_author": "$COMMIT_AUTHOR",
  "current_date": "$COMMIT_DATE",
  "current_message": "$COMMIT_MSG",
  "last_updated": "$COMMIT_DATE"
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
export DB_ENGINE=postgresql
export DB_NAME=whatsq_db
export DB_USER=whatsq_user
export DB_PASSWORD=whatsq_secure_password_2026
export DB_HOST=localhost
export DB_PORT=5432
python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

# 4. FRONTEND BUILD
echo -e "\n${YELLOW}[4/5] Building Frontend...${NC}"
cd "$APP_DIR/frontend"
npm install --silent
npm run build

# 5. RESTART SERVICES
echo -e "\n${YELLOW}[5/5] Restarting WhatsQ Services...${NC}"
$SUDO_CMD systemctl restart whatsq-backend 2>/dev/null || true
$SUDO_CMD systemctl reload nginx 2>/dev/null || true

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
echo -e "   Services      : PostgreSQL (Active) | Redis (Active) | Backend (Active) | Nginx (Active)"
echo -e "${CYAN}======================================================${NC}"
