#!/usr/bin/env bash
# AeroTrip — seed the database and start the API + web dev server.
#
# Usage:
#   ./run.sh                 # seed and start everything
#   ./run.sh --no-seed       # keep existing data, just start servers
#   PORT=3002 WEB_PORT=5174 ./run.sh
#
# MariaDB is NOT managed here: start it yourself (see the "Database
# (manual setup)" section of README.md) and create server/.env from
# server/.env.example first. This script only handles dependencies, seeding,
# and starting the API + web dev servers.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v bun >/dev/null 2>&1      || fail "bun is required (https://bun.sh)"

# The backend uses PEP 604 annotations (e.g. `float | int`), so it needs 3.10+.
# Prefer a newer interpreter over the macOS system python3 (often 3.9).
PYTHON_BIN=""
for candidate in "${PYTHON:-}" python3.12 python3.13 python3.14 python3.15 python3.11 python3.10 python3; do
  [[ -n "$candidate" ]] || continue
  command -v "$candidate" >/dev/null 2>&1 || continue
  if "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
    PYTHON_BIN="$candidate"
    break
  fi
done
[[ -n "$PYTHON_BIN" ]] || fail "Python 3.10+ is required — install it or set PYTHON=/path/to/python3.12"

API_PORT="${PORT:-3001}"
WEB_PORT="${WEB_PORT:-5173}"
SEED=true
[[ "${1:-}" == "--no-seed" ]] && SEED=false

# ---------------------------------------------------------------------------
# 1. Configuration (the database itself is started manually, before this script)
# ---------------------------------------------------------------------------
[[ -f server/.env ]] || fail "server/.env is missing — copy server/.env.example and fill in the DB credentials"
if grep -q '<password>' server/.env; then
  fail "server/.env still contains <password> placeholders — fill in the real DB password"
fi

# ---------------------------------------------------------------------------
# 2. Dependencies
# ---------------------------------------------------------------------------
if [[ ! -d node_modules ]]; then
  log "Installing frontend dependencies"
  bun install
fi

if [[ ! -x server/.venv/bin/python ]] || \
   ! server/.venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
  log "Creating Python virtual environment with $PYTHON_BIN"
  rm -rf server/.venv
  "$PYTHON_BIN" -m venv server/.venv
fi

if ! server/.venv/bin/python -c "import fastapi, sqlalchemy, pymysql, PIL, jwt, bcrypt" >/dev/null 2>&1; then
  log "Installing backend dependencies"
  server/.venv/bin/python -m pip install -q -r server/requirements.txt
fi

# ---------------------------------------------------------------------------
# 3. Seed
# ---------------------------------------------------------------------------
if [[ "$SEED" == true ]]; then
  log "Seeding database (inventory + accounts)"
  (cd server && .venv/bin/python seed.py)
fi

# ---------------------------------------------------------------------------
# 4. Start both servers
# ---------------------------------------------------------------------------
log "Starting API on http://127.0.0.1:${API_PORT}"
(cd server && exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port "$API_PORT" --reload) &
API_PID=$!

log "Starting web app on http://localhost:${WEB_PORT} (proxies /api to :${API_PORT})"
bun run dev -- --host 127.0.0.1 --port "$WEB_PORT" &
WEB_PID=$!

cleanup() {
  trap - INT TERM EXIT          # don't run twice (signal + EXIT)
  printf '\nStopping servers...\n'
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

printf '\nReady. Seeded logins:\n'
printf '  admin   / admin   -> admin@aerotrip.test / admin\n'
printf '  tourist / tourist -> tourist@aerotrip.test / tourist\n'
printf '\nPress Ctrl+C to stop both servers.\n'

# macOS ships bash 3.2, which has no `wait -n`; poll until either server exits
# so the EXIT trap tears down the other one.
while kill -0 "$API_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 1
done
