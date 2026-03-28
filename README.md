<div align="center">
  <h1>🏗️ Nirman</h1>
  <p><strong>The Next-Generation, Open Source Backend-as-a-Service (BaaS)</strong></p>
  <p>Authentication, Database Collections, Realtime Sync, and a unique Plug-and-Play Integrations Hub.</p>
</div>

Nirman is a high-performance, polyglot microservices platform built for modern development. Need to switch from Twilio to MSG91 or from SendGrid to Resend? Do it instantly from the Dashboard without touching a single line of application code.

## 🌟 Architecture & Tech Stack

Our platform leverages a highly-optimized polyglot monorepo structure orchestrated by **Turborepo** and designed around strict **Clean Architecture** patterns.

- **Gateway (Go + Chi + pgxpool)**: The blazing-fast entry point. Handles JWT/API Key authentications, strict rate-limiting via Redis, dynamic database connections via `pgxpool`, and proxies complex requests.
- **Hub (Bun + Hono)**: The dynamic JavaScript/TypeScript Integrations Hub. Contains decoupled domain adapters (`otp/`, `email/`, `maps/`) loaded via a secure database-backed vault at runtime.
- **Workers (Python + Celery)**: Built for data science, AI tasks, webhooks, and heavy background jobs. Containerized with `httpx` and standard `pyproject.toml` constraints.
- **Realtime (Go + WebSockets)**: An ultra-lightweight Gorilla WebSocket server dynamically synced with Redis Pub/Sub for instant connection management and fanned-out events.
- **Dashboard (Next.js 15)**: A beautiful, modern Admin UI built with the App Router, Shadcn/UI, Tailwind CSS v4, and stunning glassmorphic design systems.

## 📂 Project Structure

 ```text
 nirman-baas/
 ├── dashboard/    # Admin UI (Next.js 15, Tailwind v4, Shadcn)
 ├── database/     # Original SQL init scripts
 ├── docs/         # Platform Documentation
 ├── gateway/      # API Gateway (Go 1.21, pgxpool, Chi)
 │   ├── cmd/server/main.go       # Graceful shutdown entry
 │   └── internal/
 │       ├── auth/                # JWT, API Keys, OAuth stubs
 │       ├── cache/               # Redis Rate Limiting
 │       ├── config/              # Env variable loading
 │       ├── database/            # pgxpool, dynamic schemas
 │       ├── handlers/            # REST endpoints
 │       ├── middleware/          # Logger, Recover, Timeout
 │       └── router/              # Chi Router setup
 ├── hub/          # Integrations Hub (Bun, Hono)
 │   └── src/integrations/        # OTP, Email, Maps adapters
 ├── infra/        # Nginx config, Postgres migrations, Redis
 ├── realtime/     # WebSockets Server (Go, Redis Pub/Sub)
 ├── sdk/
 │   ├── python/       # Official Python Client
 │   └── typescript/   # Official TS Client
 ├── shared/       # Cross-boundary TS interfaces
 ├── workers/      # Celery Workers (Python, background tasks)
 ├── docker-compose.yml # Container orchestration
 ├── turbo.json    # Turborepo Build Pipelines
 └── package.json  # Root NPM Workspace Manifest
 ```

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose (Background Linux Engine enabled)
- Node.js (v20+)

### 2. Setup
Clone the repository and install the workspace tooling:
```bash
git clone https://github.com/yourusername/nirman-baas.git
cd nirman-baas
npm install
```

*(Note: We use NPM Workspaces strictly defined via `packageManager: "npm@10.0.0"` for Turborepo telemetry).*

### 3. Run the Monorepo
Spin up the entire microservices stack locally with isolated Docker networks:
```bash
docker compose up --build -d
```
*Alternatively, for frontend-only development: `npx turbo run dev`.*

### 4. Access the Ports
Once running, the stack maps to:
- **Admin Dashboard**: http://localhost:3001
- **API Gateway**: http://localhost:8080
- **Integrations Hub (Internal)**: http://localhost:3000
- **Realtime Server**: ws://localhost:8000
- **PostgreSQL**: `localhost:5432` (User: nirman, DB: nirman_baas)
- **Redis Cache**: `localhost:6379`

## 📚 SDK Usage (TypeScript Example)

```typescript
import { NirmanClient } from "@nirman/sdk";

const client = new NirmanClient("nk_live_your_api_key_here");

// Send an OTP instantly based on your configured Integration Hub logic
await client.otp.send("+919876543210");
```

## 📄 License
BSD 3-Clause License. See [LICENSE](LICENSE) for details.
