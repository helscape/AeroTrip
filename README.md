# AeroTrip — Flight Search & Booking

A working end-to-end flight search and booking app: Preact + TypeScript + Vite
on the frontend, FastAPI + SQLAlchemy on the backend, backed by **MariaDB**.

The landing page is now an airline-style booking entry point: a real search
widget on a hero image, live sample inventory, and a guided booking funnel
(**Flight → Travelers → Review & pay → Confirmation**). There is also a full
account area (register / sign in / profile / "My trips"), guest checkout,
booking management with a proper cancel confirmation dialog, a help center and
legal pages. Every link and button is wired to a real route or action.

Design proposal: [`future_plan.md`](./future_plan.md).

---

## Tech stack

### Frontend

| Concern | Choice |
| --- | --- |
| Runtime / PM | **Bun** |
| Framework | **Preact** + `preact-iso` router |
| State | Context API (auth, toasts) + URL query params — no global store |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** (navy/sky tokens) |
| Build tool | **Vite** + `@preact/preset-vite` |
| Icons | **Lucide** (`lucide-preact`) |

### Backend

| Concern | Choice |
| --- | --- |
| Language / runtime | **Python 3.12+** |
| HTTP framework | **FastAPI** (validation, OpenAPI at `/docs`) |
| Validation | **Pydantic v2** |
| ORM | **SQLAlchemy 2.0** |
| Database | **MariaDB 11** via **PyMySQL** (`mysql+pymysql://`) |
| Server | **Uvicorn** |
| IDs / money | `uuid4` / integer cents |
| Auth | **JWT** (bcrypt password hashes, HS256 bearer tokens) |

The plan specified SQLite; this implementation uses the MariaDB instance from
the existing Docker Compose stack at `~/Project/Docker/Webserver` instead.
Two databases were created there: `aerotrip` (app) and `aerotrip_test` (pytest),
plus a dedicated `aerotrip` user. There is no cache, queue or extra service.

---

## Getting started

### Quick start (one command)

Start MariaDB yourself and make sure `server/.env` is configured first (see
[Database](#1-database-manual-setup) and [Environment variables](#environment-variables)).
`./run.sh` does not start or provision the database.

```bash
./run.sh                 # seed the DB, then start API + web dev server
```

The script installs missing dependencies, seeds the database, and starts both
servers in the foreground. Press Ctrl+C to stop both. Variants:

```bash
./run.sh --no-seed             # keep existing data
PORT=3002 WEB_PORT=5174 ./run.sh
```

Seeded logins:

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| admin | `admin@aerotrip.test` | `admin` | admin |
| tourist | `tourist@aerotrip.test` | `tourist` | user |
| demo | `demo@aerotrip.test` | `demo1234` | user |

The admin account can call `/api/admin/*` with just its Bearer token (the
`x-admin-key` header still works too). Guest checkout remains available.

### 1. Database (manual setup)

MariaDB must be running. In the Webserver compose stack:

```bash
cd ~/Project/Docker/Webserver
docker compose up -d mariadb
docker compose ps        # health check should report "healthy"
```

Create the app databases once (root password comes from that stack's `.env`):

```bash
set -a; source .env; set +a
docker exec -i webserver-mariadb-1 mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" <<'SQL'
CREATE DATABASE IF NOT EXISTS aerotrip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS aerotrip_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'aerotrip'@'%' IDENTIFIED BY '<choose-a-password>';
GRANT ALL PRIVILEGES ON aerotrip.* TO 'aerotrip'@'%';
GRANT ALL PRIVILEGES ON aerotrip_test.* TO 'aerotrip'@'%';
FLUSH PRIVILEGES;
SQL
```

### 2. Backend

```bash
cd server
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env          # fill in the DATABASE_URL password + ADMIN_API_KEY
.venv/bin/python seed.py      # create tables and load sample inventory
.venv/bin/python -m uvicorn app.main:app --reload --port 3001
```

`server/.env` is gitignored. Interactive docs: <http://localhost:3001/docs>.

### 3. Frontend

```bash
cd ..
bun install
bun run dev                   # http://localhost:5173 (proxies /api → :3001)
```

From the repo root you can also use:

| Command | What it does |
| --- | --- |
| `bun run dev` | Vite dev server |
| `bun run dev:api` | Uvicorn with reload on port 3001 |
| `bun run seed` | Re-seed the MariaDB database |
| `bun run typecheck` | TypeScript strict check |
| `bun run build` | Typecheck + production build to `dist/` |
| `bun run test:api` | pytest suite against `aerotrip_test` |

---

## Environment variables

All backend configuration lives in **`server/.env`**, loaded by `pydantic-settings`.
It is gitignored and must never be committed. Copy the template and fill in real
values before running `./run.sh`:

```bash
cd server
cp .env.example .env
```

### Backend — `server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLAlchemy URL for MariaDB via PyMySQL. Format: `mysql+pymysql://USER:PASSWORD@HOST:PORT/DB?charset=utf8mb4`. The app database is `aerotrip`. |
| `TEST_DATABASE_URL` | yes | Same format, pointing at `aerotrip_test`. **Never point this at the live database** — pytest drops all tables in it. |
| `JWT_SECRET` | yes | Secret for signing access tokens (HS256). Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. Changing it signs out all existing users. |
| `JWT_TTL_HOURS` | no | Token lifetime in hours (default `168`). |
| `ADMIN_API_KEY` | yes | Value required in the `x-admin-key` header for `/api/admin/*`. Generate with `openssl rand -hex 24`. Admin users may instead use a Bearer token. |
| `CORS_ORIGINS` | no | Comma-separated allowed browser origins. Defaults to localhost `5173`. |
| `PORT` | no | API port (default `3001`). |

A complete example:

```dotenv
# --- Database (credentials come from the Webserver compose stack's .env) ---
DATABASE_URL=mysql+pymysql://aerotrip:CHANGE_ME@localhost:3306/aerotrip?charset=utf8mb4
TEST_DATABASE_URL=mysql+pymysql://aerotrip:CHANGE_ME@localhost:3306/aerotrip_test?charset=utf8mb4

# --- Auth ---
JWT_SECRET=replace-with-64-hex-characters-from-secrets-token_hex-32
JWT_TTL_HOURS=168
ADMIN_API_KEY=replace-with-a-random-hex-string

# --- Network ---
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PORT=3001
```

**Where the DB credentials come from:** the MariaDB instance is defined in
`~/Project/Docker/Webserver/docker-compose.yml`; its root password is in that
stack's `.env`. The `aerotrip` user/database are created by the SQL in the
Database section above. Use the *app user* credentials in `DATABASE_URL`, not the
root password. The root password is only needed once to create the database and
grant privileges. Start the stack manually before running `./run.sh`; the script
expects the database to already be up.

### Frontend — `.env` (optional, production only)

See `.env.example`. In development the Vite proxy forwards `/api` to
`http://localhost:3001`, so this is not needed locally.

```dotenv
VITE_API_URL=https://api.aerotrip.example.com
```

Seeding also creates the three accounts listed above (admin, tourist, demo).

### Sample data

`bun run seed` generates a reproducible synthetic inventory with a fixed random
seed: **29 airports, 21 airlines, 34 route pairs and ~9,000 flights** across the
next 45 days. Each flight gets a randomized airline, flight number, departure
time, duration, stops, cabin class, fare and seat count. Every route/day has at
least one direct economy fare so filters always return results. Tests use a
smaller generated dataset (`compact=True`) to stay fast.

All values are invented for the demo. Airport and airline codes are real; fares
and schedules are not.

### Ticket images

Each confirmation includes a boarding pass PNG generated on demand by
`server/app/lib/ticket.py` (Pillow). Route, date, passenger names, flight number,
seat and gate are filled from the booking, and a reference-derived barcode is
drawn on the stub. The confirmation page offers **Download** (PNG) and
**Print ticket** (opens a print-ready landscape view). Fonts are bundled in
`server/app/assets/`, so generation has no system-font dependency.

### Images

Travel photography under `public/images/` is used for the rotating hero
background (Windows Spotlight-style, 8-second cycle) and destination cards.
Each destination uses a recognizable landmark: Tanah Lot (Bali), Shibuya
Crossing (Tokyo), Marina Bay Sands (Singapore), Wat Arun (Bangkok),
Gwanghwamun (Seoul) and the Eiffel Tower (Paris). Sources: Wikimedia Commons,
cropped colour-enhanced locally. They are demo assets only.

### Free flight data APIs (evaluated)

We looked at wiring in a live provider instead of generated data:

| Provider | Free tier | Limitation |
| --- | --- | --- |
| [Amadeus Self-Service](https://developers.amadeus.com/) | Free API keys, including Flight Offers Search with real fares | Requires signup; best fit if real booking data is needed later |
| [AviationStack](https://aviationstack.com/pricing) | 100 requests/month, non-commercial | No date-based search or future schedules on the free tier |
| [OpenSky Network](https://openskynetwork.github.io/opensky-api/rest.html) | Anonymous access, 400 credits/day, no key | Live ADS-B tracking only — no fares, no future schedules |

Generated seed data was chosen for now: it needs no external account, keeps the
app fully offline, and still exercises search, filters, booking and seat
management realistically.

Frontend (optional, for production static hosting):

```dotenv
VITE_API_URL=https://api.aerotrip.example.com
```

In development, Vite proxies `/api` to `http://localhost:3001`, so no CORS or
`VITE_API_URL` is needed.

---

## API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/api/health` | Health + DB check | none |
| GET | `/api/airports?q=jak` | Airport lookup | none |
| GET | `/api/flights/search` | Search outbound + return | none |
| GET | `/api/flights` | List inventory | none |
| GET | `/api/flights/:id` | Flight detail | none |
| POST | `/api/auth/register` | Create account → `{ token, user }` | none |
| POST | `/api/auth/login` | Sign in → `{ token, user }` | none |
| GET / PATCH | `/api/auth/me` | Read / update profile | Bearer |
| GET | `/api/me/bookings` | Bookings owned by the signed-in user | Bearer |
| POST | `/api/bookings` | Create booking | guest or Bearer |
| GET | `/api/bookings/:reference?email=` | Read booking | reference + email |
| GET | `/api/bookings/:reference/ticket?email=` | Generated boarding-pass PNG | reference + email |
| GET | `/api/bookings?email=` | List bookings by email | email |
| PATCH | `/api/bookings/:id?reference=&email=` | Update contact details | reference + email |
| DELETE | `/api/bookings/:id?reference=&email=` | Soft cancel, seats restored | reference + email |
| POST | `/api/admin/flights` | Create flight | `x-admin-key` |
| PUT | `/api/admin/flights/:id` | Update flight | `x-admin-key` |
| DELETE | `/api/admin/flights/:id` | Delete flight | `x-admin-key` |

Errors use one envelope:

```json
{ "error": { "code": "CONFLICT", "message": "Not enough seats available", "details": [] } }
```

Booking creation is a single SQLAlchemy transaction with a conditional seat
`UPDATE` and `rowcount` check, so seats cannot be oversold. Cancellation reverses
that update. Payments, accounts, email delivery and caching are intentionally
out of scope.

---

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Airline-style landing page + live search widget |
| `/search` | Outbound/return results with filters and sorting |
| `/flights/:id` | Flight detail |
| `/booking` | Guided funnel: Travelers → Review & pay (demo payment) |
| `/bookings/:reference` | Confirmation |
| `/manage` | Lookup, update contact, cancel (with confirmation dialog) |
| `/login` | Sign in / register (switchable tabs) |
| `/account` | Protected profile + all bookings for the signed-in user |
| `/help` | Searchable FAQ |
| `/legal/:topic` | Terms, privacy and cookie settings |

Booking creation is idempotent for guests and accounts alike. When signed in,
bookings are linked to the user and `/api/me/bookings` lists them; owners can
update or cancel with just a Bearer token, while guests keep the reference +
email flow.

`init_db()` applies additive migrations on startup/seed (e.g. adding the
`bookings.user_id` column to an older MariaDB schema) so re-seeding after a
pull just works.

---

## Tests

`bun run test:api` runs 27 pytest cases covering airport search, flight search
filters, validation, booking totals/seat decrement, insufficient seats (409),
lookup by reference + email, contact updates, cancellation/seat restoration,
admin CRUD auth, registration/login, protected routes, owner-only updates and
guest compatibility. Each test recreates the schema in `aerotrip_test`.

Diagrams (PlantUML + Mermaid) remain under [`diagrams/`](./diagrams/).
