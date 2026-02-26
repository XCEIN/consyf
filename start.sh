#!/usr/bin/env bash
# Start Consyf frontend and backend together
# OS: Linux, shell: bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="$ROOT_DIR/front-end"
BACK_DIR="$ROOT_DIR/backend"

# Default envs (override via .env files)
export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-http://localhost:4000}"

# Load backend env if present
if [ -f "$BACK_DIR/.env" ]; then
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$BACK_DIR/.env" | xargs)
fi

# Ensure node modules installed
if [ ! -d "$BACK_DIR/node_modules" ]; then
  echo "[setup] Installing backend deps..."
  (cd "$BACK_DIR" && npm install)
fi
if [ ! -d "$FRONT_DIR/node_modules" ]; then
  echo "[setup] Installing frontend deps..."
  (cd "$FRONT_DIR" && npm install)
fi

# Start processes
echo "[start] Backend on :4000 | Frontend on :3000"

# Start backend (explicit PORT=4000)
(cd "$BACK_DIR" && PORT=4000 npm run dev) & BACK_PID=$!
# Start frontend (explicit PORT=3000)
(cd "$FRONT_DIR" && PORT=3000 npm run dev) & FRONT_PID=$!

# Trap to cleanup
cleanup() {
  echo "\n[stop] Shutting down..."
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
  wait "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}
trap cleanup INT TERM

# Wait on both
wait "$BACK_PID" "$FRONT_PID"
