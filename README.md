<div align="center">
	<h1>🏗️ Nirman</h1>
	<p><strong>The Next-Generation, Open Source Backend-as-a-Service (BaaS)</strong></p>
	<p>Authentication, Database Collections, Realtime Sync, and a unique Plug-and-Play Integrations Hub.</p>
</div>

Nirman is a high-performance, polyglot microservices platform built for modern development. Need to switch from Twilio to MSG91 or from SendGrid to Resend? Do it instantly from the Dashboard without touching a single line of application code.

## 🌟 Architecture & Tech Stack

Nirman follows a polyglot microservices architecture where each service is optimized for its job.

| Layer | Service | Stack | Purpose |
|---|---|---|---|
| API Layer | Gateway | Go, Chi, PostgreSQL, Redis | Auth, project APIs, API key validation, routing/proxy |
| Integration Layer | Hub | Bun, Hono, TypeScript | Provider adapters (OTP, Email, Maps, Notifications, Storage) |
| Async Layer | Workers | Python, Celery, Redis | Background jobs, retries, cleanup schedules |
| Realtime Layer | Realtime | Go, WebSockets, Redis Pub/Sub | Live updates and project-scoped realtime channels |
| UI Layer | Dashboard | Next.js, React, TypeScript | Admin panel for projects, keys, integrations |
| Infra Layer | Infra | Docker Compose, Nginx, PostgreSQL, Redis | Orchestration, reverse proxy, persistence, messaging |

### Core Technologies
- **Go**: High-performance API and realtime services
- **Bun + Hono**: Fast integrations execution engine
- **Python + Celery**: Reliable async task processing
- **PostgreSQL**: Primary relational data store
- **Redis**: Caching, broker, and pub/sub transport
- **Next.js**: Dashboard and developer control plane
- **Docker Compose**: Local self-hosted deployment

## 📂 Project Structure

```
nirman-baas/
├── .gitignore
├── LICENSE
├── README.md
├── package.json                          # Root NPM workspace manifest
├── package-lock.json
├── turbo.json                            # Turborepo build pipelines
├── docker-compose.yml                    # Full-stack container orchestration
│
├── gateway/                              # Go API Gateway (Chi + pgxpool)
│   ├── Dockerfile
│   ├── go.mod
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                   # Entry point, graceful shutdown
│   └── internal/
│       ├── auth/
│       │   ├── jwt.go                    # Issue/verify JWT + refresh
│       │   ├── apikey.go                 # Generate + validate API keys
│       │   ├── oauth.go                  # OAuth stubs (Google/GitHub/Apple)
│       │   └── middleware.go             # JWT + API Key middleware
│       ├── cache/
│       │   └── redis.go                  # Redis client + rate limit helpers
│       ├── config/
│       │   └── config.go                 # Env vars, all settings
│       ├── database/
│       │   ├── postgres.go               # pgxpool connection
│       │   ├── query.go                  # Dynamic query builder
│       │   └── schema.go                 # Create/drop collections
│       ├── handlers/
│       │   ├── handlers.go              # Base handler + helpers
│       │   ├── response.go              # JSON response utilities
│       │   ├── auth.go                  # Register/Login/Refresh
│       │   ├── collections.go           # Full CRUD + schema mgmt
│       │   └── integrations.go          # Proxy to Hub + storage + projects
│       ├── middleware/
│       │   └── middleware.go            # Logger, RateLimit, Recover
│       ├── models/
│       │   ├── user.go
│       │   ├── project.go
│       │   ├── api_key.go
│       │   └── integration.go
│       └── router/
│           └── router.go                # All routes registered
│
├── hub/                                  # Integrations Hub (Bun + Hono)
│   ├── Dockerfile
│   ├── package.json
│   ├── bunfig.toml
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                      # Hono server entry
│       ├── middleware/
│       │   └── auth.ts                   # Internal-only auth guard
│       ├── vault/
│       │   └── credentials.ts            # AES-256-GCM credential store
│       ├── registry/
│       │   └── providers.ts              # Dynamic provider loader
│       └── integrations/
│           ├── otp/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── twilio.ts
│           │       ├── msg91.ts
│           │       └── twofactor.ts
│           ├── email/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── sendgrid.ts
│           │       ├── resend.ts
│           │       └── ses.ts
│           ├── maps/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── googlemaps.ts
│           │       ├── mapbox.ts
│           │       └── ola.ts
│           ├── notifications/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── fcm.ts
│           │       ├── apns.ts
│           │       └── onesignal.ts
│           ├── payments/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── razorpay.ts
│           │       ├── stripe.ts
│           │       └── payu.ts
│           ├── ai/
│           │   ├── index.ts
│           │   └── providers/
│           │       ├── openai.ts
│           │       ├── gemini.ts
│           │       └── claude.ts
│           └── storage/
│               └── providers/
│                   └── s3.ts
│
├── workers/                              # Background Workers (Python + Celery)
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── __init__.py
│       ├── celery.py                     # Celery app + Redis broker
│       ├── config.py                     # Environment config
│       ├── database.py                   # PostgreSQL connection helpers
│       └── tasks/
│           ├── __init__.py
│           ├── webhook_task.py           # HMAC-signed webhook delivery
│           ├── email_task.py             # Queued email sending
│           ├── notification_task.py      # Push notification dispatch
│           └── cleanup_task.py           # Scheduled data cleanup
│
├── realtime/                             # WebSocket Server (Go + Redis Pub/Sub)
│   ├── Dockerfile
│   ├── go.mod
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                   # WS server entry
│   └── internal/
│       ├── auth/
│       │   └── jwt.go                    # Token validation for WS
│       ├── hub/
│       │   ├── hub.go                    # Connection manager
│       │   └── client.go                 # Per-client read/write pumps
│       └── pubsub/
│           └── redis.go                  # Redis subscriber → broadcast
│
├── dashboard/                            # Admin UI (Next.js 15)
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                # Root layout (dark theme)
│       │   ├── page.tsx                  # Dashboard overview
│       │   └── globals.css               # Tailwind v4 base
│       ├── components/
│       │   └── ui/
│       │       └── button.tsx            # Shadcn button
│       └── lib/
│           └── utils.ts                  # cn() class merger
│
├── sdk/
│   ├── typescript/                       # Official TS Client (@nirman/sdk)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts                  # NirmanClient class
│   └── python/                           # Official Python Client
│       ├── pyproject.toml
│       ├── README.md
│       └── src/
│           └── nirman/
│               ├── __init__.py
│               └── client.py             # NirmanClient (httpx)
│
├── shared/                               # Cross-boundary TS interfaces
│   ├── package.json
│   └── index.ts
│
├── database/                             # Original SQL init script
│   └── init.sql
│
├── infra/                                # Infrastructure configs
│   ├── nginx/                            # Reverse proxy config
│   ├── postgres/                         # Migration SQL files
│   ├── redis/                            # Redis config
│   └── scripts/                          # Utility scripts
│
└── docs/                                 # Platform documentation
		├── lists/
		├── references/
		├── sdks/
		├── services/
		├── specs/
		└── tutorials/
```

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v20+)

### 2. Setup
```bash
git clone https://github.com/yourusername/nirman-baas.git
cd nirman-baas
npm install
```

### 3. Run
```bash
docker compose up --build -d
```

### 4. Ports
| Service | URL |
|---|---|
| Admin Dashboard | http://localhost:3001 |
| API Gateway | http://localhost:8080 |
| Integrations Hub (Internal) | http://localhost:3000 |
| Realtime Server | ws://localhost:8000 |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## 📚 SDK Usage

**TypeScript**
```typescript
import { NirmanClient } from "@nirman/sdk";
const client = new NirmanClient("nk_live_your_api_key_here");
await client.otp.send("+919876543210");
```

**Python**
```python
from nirman import NirmanClient
client = NirmanClient(api_key="nk_live_your_api_key_here")
client.otp.send(phone="+919876543210")
```

## 📄 License
BSD 3-Clause License. See [LICENSE](LICENSE) for details.
