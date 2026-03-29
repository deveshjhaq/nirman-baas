# Nirman (Hindi)

![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8)
![Bun](https://img.shields.io/badge/Bun-Latest-black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

Nirman ek open source Backend-as-a-Service (BaaS) platform hai jo modern apps ke liye polyglot microservices architecture provide karta hai.

## Mukhya Features

- Authentication aur API key based access
- Realtime updates (WebSocket + Redis Pub/Sub)
- Background workers (Python + Celery)
- Plug-and-play integrations (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Docker Compose ke saath self-hosted deployment

## Architecture aur Tech Stack

| Layer | Service | Stack | Purpose |
|---|---|---|---|
| API Layer | Gateway | Go, Chi, PostgreSQL, Redis | Auth, project APIs, API key validation, routing/proxy |
| Integration Layer | Hub | Bun, Hono, TypeScript | Provider adapters aur integration execution |
| Async Layer | Workers | Python, Celery, Redis | Background jobs, retries, scheduled cleanup |
| Realtime Layer | Realtime | Go, WebSockets, Redis Pub/Sub | Live updates aur project-scoped channels |
| UI Layer | Dashboard | Next.js, React, TypeScript | Admin panel |
| Infra Layer | Infra | Docker Compose, Nginx, PostgreSQL, Redis | Orchestration aur persistence |

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

## SDK Usage

TypeScript:

```typescript
import { NirmanClient } from "@nirman/sdk";
const client = new NirmanClient("nk_live_your_api_key_here");
await client.otp.send("+919876543210");
```

Python:

```python
from nirman import NirmanClient
client = NirmanClient(api_key="nk_live_your_api_key_here")
client.otp.send(phone="+919876543210")
```

## More Details

English full guide ke liye [README.md](README.md) dekhein.
