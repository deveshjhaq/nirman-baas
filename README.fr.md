# Nirman (Francais)

Nirman est une plateforme open source de Backend-as-a-Service (BaaS) pour les applications modernes.

## Fonctionnalites principales

- Authentification et acces via API key
- Mises a jour en temps reel (WebSocket + Redis Pub/Sub)
- Workers en arriere-plan (Python + Celery)
- Integrations plug-and-play (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Deploiement self-hosted avec Docker Compose

## Stack technique

- Gateway: Go + Chi
- Hub: Bun + Hono
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: PostgreSQL + Redis + Nginx + Docker Compose

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

## Plus de details

Consultez [README.md](README.md) pour la documentation complete.
