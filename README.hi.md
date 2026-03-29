# Nirman (Hindi)

Nirman ek open source Backend-as-a-Service (BaaS) platform hai jo modern apps ke liye banaya gaya hai.

## Mukhya Features

- Authentication aur API key based access
- Realtime updates (WebSocket + Redis Pub/Sub)
- Background workers (Python + Celery)
- Plug-and-play integrations (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Docker Compose ke saath self-hosted setup

## Tech Stack

- Gateway: Go + Chi
- Hub: Bun + Hono
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: PostgreSQL + Redis + Nginx + Docker Compose

## Quick Start

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build -d
```

## Default URLs

- Dashboard: http://localhost:3001
- Gateway: http://localhost:8080
- Hub: http://localhost:3000
- Realtime: ws://localhost:8000

## More Details

Full documentation ke liye [README.md](README.md) dekhein.
