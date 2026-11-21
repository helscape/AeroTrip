#!/usr/bin/env bash
# AeroTrip — seed the database and start the API + web dev server.
#
# Usage:
#   ./run.sh                 # seed and start everything
#   ./run.sh --no-seed       # keep existing data, just start servers
#   PORT=3002 WEB_PORT=5174 ./run.sh
#
# If server/.env is missing, the script provisions the MariaDB instance from
# the Webserver compose stack and writes a fresh .env. Override its location
# with WEBSERVER_COMPOSE_DIR=/path/to/stack.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

log()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v bun >/dev/null 2>&1      || fail "bun is required (https://bun.sh)"
command -v python3 >/dev/null 2>&1  || fail "python3 is required"
command -v docker >/dev/null 2>&1   || true

API_PORT="${PORT:-3001}"
WEB_PORT="${WEB_PORT:-5173}"
SEED=true
[[ "${1:-}" == "--no-seed" ]] && SEED=false

# ---------------------------------------------------------------------------
# 1. Database environment
# ---------------------------------------------------------------------------
provision_database() {
  local compose_dir="${WEBSERVER_COMPOSE_DIR:-$HOME/Projects/Docker/Webserver}"
  local env_file="$compose_dir/.env"
  local compose_file="$compose_dir/docker-compose.yml"

  [[ -f "$env_file" ]] || fail "Database env not found: $env_file (set WEBSERVER_COMPOSE_DIR)"
  [[ -f "$compose_file" ]] || fail "Compose file not found: $compose_file"

  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a

  : "${MARIADB_ROOT_PASSWORD:?set MARIADB_ROOT_PASSWORD in $env_file}"

  local db_password
  db_password="$(openssl rand -hex 18)"

  log "Starting MariaDB container"
  docker compose -f "$compose_file" up -d mariadb

  log "Waiting for MariaDB to become healthy"
  for _ in $(seq 1 30); do
    if docker exec webserver-mariadb-1 healthcheck.sh --connect --innodb_initialized >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done

  log "Creating aerotrip databases and user"
  docker exec -i webserver-mariadb-1 mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS aerotrip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS aerotrip_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'aerotrip'@'%' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON aerotrip.* TO 'aerotrip'@'%';
GRANT ALL PRIVILEGES ON aerotrip_test.* TO 'aerotrip'@'%';
FLUSH PRIVILEGES;
SQL

  cat > server/.env <<EOF
DATABASE_URL=mysql+pymysql://aerotrip:${db_password}@localhost:3306/aerotrip?charset=utf8mb4
TEST_DATABASE_URL=mysql+pymysql://aerotrip:${db_password}@localhost:3306/aerotrip_test?charset=utf8mb4
ADMIN_API_KEY=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
JWT_TTL_HOURS=168
CORS_ORIGINS=http://localhost:${WEB_PORT},http://127.0.0.1:${WEB_PORT}
PORT=${API_PORT}
EOF
  chmod 600 server/.env
  log "Wrote server/.env"
}

if [[ ! -f server/.env ]] || grep -q '<password>' server/.env; then
  provision_database
fi

# ---------------------------------------------------------------------------
# 2. Dependencies
# ---------------------------------------------------------------------------
if [[ ! -d node_modules ]]; then
  log "Installing frontend dependencies"
  bun install
fi

if [[ ! -x server/.venv/bin/python ]]; then
  log "Creating Python virtual environment"
  python3 -m venv server/.venv
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
(cd server && .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port "$API_PORT" --reload) &
API_PID=$!

log "Starting web app on http://localhost:${WEB_PORT} (proxies /api to :${API_PORT})"
bun run dev -- --host 127.0.0.1 --port "$WEB_PORT" &
WEB_PID=$!

cleanup() {
  printf '\nStopping servers...\n'
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

printf '\nReady. Seeded logins:\n'
printf '  admin   / admin   -> admin@aerotrip.test / admin\n'
printf '  tourist / tourist -> tourist@aerotrip.test / tourist\n'
printf '\nPress Ctrl+C to stop both servers.\n'

wait -n
