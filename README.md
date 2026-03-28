# 🏗️ Nirman
**The Open Source Backend-as-a-Service (BaaS) Platform.**

Nirman is a high-performance, polyglot microservices platform designed to provide Authentication, Database, Realtime Sync, and a unique **Plug-and-Play Integrations Hub**. Connect any third-party service (Stripe, Twilio, OpenAI, SendGrid) without writing new integration code.

## 🌟 Features
- **Polyglot Microservices**: Designed for speed and flexibility.
  - **Gateway** (Go + Chi) for blazing-fast routing and auth.
  - **Hub** (Bun + Hono) for dynamic JavaScript/TypeScript integration logic.
  - **Workers** (Python + Celery) for data science, AI, and heavy background jobs.
  - **Realtime** (Go) for instant WebSocket updates via Redis Pub/Sub.
- **Plug-and-Play**: Switch from Twilio to MSG91 instantly from the Dashboard. No code changes required on your end.
- **Beautiful Dashboard**: Built with Next.js 15 (App Router) & shadcn/ui.
- **Typed SDKs**: Official TypeScript and Python SDKs.

## 📂 Project Structure (Turborepo)
```text
nirman/
├── gateway/      # API Gateway & Core Logic (Go)
├── hub/          # Integrations Hub (Bun + JS)
├── workers/      # Background Workers (Python + Celery)
├── realtime/     # Realtime WebSocket Server (Go)
├── infra/        # PostgreSQL migrations, Redis config, Nginx
├── dashboard/    # Admin UI (Next.js 15)
├── sdk/          # Client SDKs (TypeScript + Python)
├── shared/       # Shared types, utils across services
├── cloud/        # Cloud-only features (billing, teams)
├── turbo.json    # Turborepo config
└── package.json  # Root workspace
```

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js (v20+)](https://nodejs.org/) & npm
- [Bun](https://bun.sh/)
- [Go (1.21+)](https://go.dev/)

### 2. Setup
Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/yourusername/nirman.git
cd nirman
npm install
```

### 3. Run Services
You can run the entire stack using Docker Compose:
```bash
docker compose up --build
```

### 4. Access the Stack
- **Admin Dashboard**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Integrations Hub (Internal)**: http://localhost:3001
- **PostgreSQL**: `localhost:5432` (User: nirman, DB: nirman_baas)
- **Redis**: `localhost:6379`

## 📚 Documentation
Please check out the `docs/` folder for guides on setting up individual SDKs and contributing integrations.

## 📄 License
BSD 3-Clause License. See [LICENSE](LICENSE) for details.
