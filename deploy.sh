#!/usr/bin/env bash
# ============================================
# CONSYF - VPS Deployment Script
# ============================================
# Usage:
#   First time:  ./deploy.sh --setup
#   Update code: ./deploy.sh
# ============================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_DIR="$ROOT_DIR/backend"
FRONT_DIR="$ROOT_DIR/front-end"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ============================================
# FIRST TIME SETUP
# ============================================
setup_vps() {
  log "=== CONSYF VPS First-Time Setup ==="

  # 1. Check Node.js
  if ! command -v node &>/dev/null; then
    err "Node.js not found! Install Node.js 18+ first:
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs"
  fi
  log "Node.js $(node -v) ✓"

  # 2. Check MySQL
  if ! command -v mysql &>/dev/null; then
    err "MySQL not found! Install MySQL first:
    sudo apt-get install -y mysql-server
    sudo mysql_secure_installation"
  fi
  log "MySQL ✓"

  # 3. Install PM2
  if ! command -v pm2 &>/dev/null; then
    log "Installing PM2..."
    sudo npm install -g pm2
  fi
  log "PM2 $(pm2 -v) ✓"

  # 4. Create database
  log "Creating database..."
  mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS consyfnew CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  log "Database 'consyfnew' ready ✓"

  # 5. Import schema
  log "Importing schema..."
  mysql -u root -p consyfnew < "$BACK_DIR/src/sql/schema.sql"
  log "Schema imported ✓"

  # 6. Setup backend .env
  if [ ! -f "$BACK_DIR/.env" ]; then
    cp "$BACK_DIR/.env.example" "$BACK_DIR/.env"
    warn "Backend .env created from .env.example"
    warn ">>> EDIT backend/.env with your production values! <<<"
  fi

  # 7. Setup frontend .env.local
  if [ ! -f "$FRONT_DIR/.env.local" ]; then
    echo "NEXT_PUBLIC_BACKEND_URL=http://YOUR_VPS_IP:4000" > "$FRONT_DIR/.env.local"
    warn "Frontend .env.local created"
    warn ">>> EDIT front-end/.env.local with your VPS IP or domain! <<<"
  fi

  # 8. Create logs directory
  mkdir -p "$ROOT_DIR/logs"

  # 9. Install & build
  deploy

  # 10. Setup PM2 startup
  log "Setting up PM2 auto-start on boot..."
  pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null || true

  log ""
  log "=== SETUP COMPLETE ==="
  log ""
  log "⚠️  IMPORTANT - Edit these files before starting:"
  log "   1. backend/.env       (MySQL password, JWT secret, domain)"
  log "   2. front-end/.env.local  (NEXT_PUBLIC_BACKEND_URL)"
  log ""
  log "Then run:  ./deploy.sh"
}

# ============================================
# DEPLOY / UPDATE
# ============================================
deploy() {
  log "=== Deploying CONSYF ==="

  # 1. Pull latest code (if git repo)
  if [ -d "$ROOT_DIR/.git" ]; then
    log "Pulling latest code..."
    git -C "$ROOT_DIR" pull origin main || warn "Git pull failed, using local files"
  fi

  # 2. Backend
  log "Installing backend dependencies..."
  (cd "$BACK_DIR" && npm ci --omit=dev 2>/dev/null || npm install --omit=dev)

  log "Building backend..."
  (cd "$BACK_DIR" && npm run build)

  # 3. Frontend
  log "Installing frontend dependencies..."
  (cd "$FRONT_DIR" && npm ci 2>/dev/null || npm install)

  log "Building frontend (this may take a few minutes)..."
  (cd "$FRONT_DIR" && npm run build)

  # 4. Restart with PM2
  log "Restarting services..."
  if pm2 list | grep -q "consyf-backend"; then
    pm2 reload ecosystem.config.cjs
  else
    (cd "$ROOT_DIR" && pm2 start ecosystem.config.cjs)
  fi

  # 5. Save PM2 state
  pm2 save

  log ""
  log "=== DEPLOY COMPLETE ==="
  log "Backend:  http://$(hostname -I | awk '{print $1}'):4000"
  log "Frontend: http://$(hostname -I | awk '{print $1}'):3000"
  log ""
  log "Useful commands:"
  log "  pm2 status          - Check running services"
  log "  pm2 logs            - View all logs"
  log "  pm2 logs consyf-backend  - View backend logs"
  log "  pm2 restart all     - Restart all services"
  log "  pm2 stop all        - Stop all services"
}

# ============================================
# MAIN
# ============================================
case "${1:-}" in
  --setup)
    setup_vps
    ;;
  --stop)
    pm2 stop ecosystem.config.cjs
    log "Services stopped"
    ;;
  --restart)
    pm2 reload ecosystem.config.cjs
    log "Services restarted"
    ;;
  --logs)
    pm2 logs
    ;;
  --status)
    pm2 status
    ;;
  *)
    deploy
    ;;
esac
