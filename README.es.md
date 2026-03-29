# Nirman (Espanol)

Nirman es una plataforma open source de Backend-as-a-Service (BaaS) para aplicaciones modernas.

## Caracteristicas principales

- Autenticacion y acceso por API key
- Actualizaciones en tiempo real (WebSocket + Redis Pub/Sub)
- Workers en segundo plano (Python + Celery)
- Integraciones plug-and-play (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Despliegue self-hosted con Docker Compose

## Stack tecnologico

- Gateway: Go + Chi
- Hub: Bun + Hono
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: PostgreSQL + Redis + Nginx + Docker Compose

## Inicio rapido

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build -d
```

## URLs por defecto

- Dashboard: http://localhost:3001
- Gateway: http://localhost:8080
- Hub: http://localhost:3000
- Realtime: ws://localhost:8000

## Mas detalles

Para la documentacion completa, consulta [README.md](README.md).
