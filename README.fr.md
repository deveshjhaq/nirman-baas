# Nirman (Francais)

![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8)
![Bun](https://img.shields.io/badge/Bun-Latest-black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

Nirman est une plateforme open source de Backend-as-a-Service (BaaS) avec une architecture microservices polyglotte.

## Fonctionnalites principales

- Authentification et acces via API key
- Mises a jour en temps reel (WebSocket + Redis Pub/Sub)
- Workers en arriere-plan (Python + Celery)
- Integrations plug-and-play (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Deploiement self-hosted avec Docker Compose

## Architecture et stack technique

| Couche | Service | Stack | Objectif |
|---|---|---|---|
| API | Gateway | Go, Chi, PostgreSQL, Redis | Auth, APIs projet, validation API key, proxy |
| Integrations | Hub | Bun, Hono, TypeScript | Adaptateurs fournisseurs et execution integrations |
| Asynchrone | Workers | Python, Celery, Redis | Taches en arriere-plan, retries, nettoyage planifie |
| Temps reel | Realtime | Go, WebSockets, Redis Pub/Sub | Canaux temps reel par projet |
| UI | Dashboard | Next.js, React, TypeScript | Panneau d'administration |
| Infra | Infra | Docker Compose, Nginx, PostgreSQL, Redis | Orchestration et persistence |

## Demarrage rapide

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build -d
```

## URLs par defaut

- Dashboard: http://localhost:3001
- Gateway: http://localhost:8080
- Hub: http://localhost:3000
- Realtime: ws://localhost:8000

## Exemples SDK

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

## Plus de details

Consultez la documentation complete en anglais: [README.md](README.md).
