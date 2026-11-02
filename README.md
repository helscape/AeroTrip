# AeroTrip — Flight Booking Landing Page

A modern, premium landing page for a flight booking platform.
Working toward a full flight search & booking system — see
[`future_plan.md`](./future_plan.md).
---

## Tech Stack

### Frontend (current)

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Runtime / PM   | **Bun**                         |
| Framework      | **Preact**                      |
| Language       | **TypeScript** (strict)         |
| Styling        | **Tailwind CSS v4**             |
| Build tool     | **Vite** + `@preact/preset-vite`|
| Icons          | **Lucide** (`lucide-preact`)    |
| Font           | **Plus Jakarta Sans**           |
| Routing (planned) | `preact-iso`                 |

### Backend (planned — [`future_plan.md` section 3.5](./future_plan.md#35-backend-design))

| Concern            | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Language / runtime | **Python 3.12+**                                    |
| HTTP framework     | **FastAPI** (validation, async, OpenAPI docs)       |
| Validation         | **Pydantic v2**                                     |
| ORM                | **SQLAlchemy 2.0**                                  |
| Database           | **SQLite** (`data/aerotrip.db`, WAL, zero service)  |
| Server             | **Uvicorn**                                         |
| IDs / money        | `uuid4` / integer cents                             |

Request flow: FastAPI router → Pydantic validation (`422` on failure) →
service → SQLAlchemy transaction → JSON with a uniform error envelope.
Interactive docs at `/docs`.

---

## Planned feature: Flight Search & Booking

One-way & round-trip search, flight detail view, passenger/contact form,
transactional booking with human-readable reference (`AT-XXXXXX`), guest
lookup by reference + email, contact update, soft cancel (seats restored),
admin flight CRUD (`x-admin-key`), seed data. Deliberately out of scope:
cache, queues, microservices, payments, accounts — see plan section 2.3.

Key endpoints (full contract in plan section 3.7):

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/api/flights/search` | Search outbound + return |
| GET | `/api/flights/:id` | Flight detail |
| POST | `/api/bookings` | Create booking (guest) |
| GET | `/api/bookings/:reference?email=` | Read booking |
| PATCH | `/api/bookings/:id` | Update contact details |
| DELETE | `/api/bookings/:id` | Cancel booking (soft) |

---

## Diagrams

31 diagrams (PlantUML + Mermaid, Indonesian labels, PNG + 16:9 slide
versions) under [`diagrams/`](./diagrams/) — index at
[`diagrams/INDEX.md`](./diagrams/INDEX.md): architecture, ER/data model,
use cases, SDLC, activity flows, class diagram, booking sequence.

---

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Start the dev server
bun run dev

# 3. Production build
bun run build

# 4. Preview the production build
bun run preview

# 5. Backend API (planned, see future_plan.md section 3.9)
cd server && uvicorn app.main:app --reload --port 3001
