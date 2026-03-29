# Nirman (Espanol)

![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8)
![Bun](https://img.shields.io/badge/Bun-Latest-black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

Nirman es una plataforma open source de Backend-as-a-Service (BaaS) con arquitectura de microservicios poliglota.

## Caracteristicas principales

- Autenticacion y acceso con API key
- Actualizaciones en tiempo real (WebSocket + Redis Pub/Sub)
- Workers en segundo plano (Python + Celery)
- Integraciones plug-and-play (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- Despliegue self-hosted con Docker Compose

## Arquitectura y stack

| Capa | Servicio | Stack | Proposito |
|---|---|---|---|
| API | Gateway | Go, Chi, PostgreSQL, Redis | Auth, APIs de proyecto, validacion de API key, proxy |
| Integraciones | Hub | Bun, Hono, TypeScript | Adaptadores de proveedores e integraciones |
| Asincrono | Workers | Python, Celery, Redis | Jobs en background, reintentos y limpieza |
| Tiempo real | Realtime | Go, WebSockets, Redis Pub/Sub | Canales en vivo por proyecto |
| UI | Dashboard | Next.js, React, TypeScript | Panel administrativo |
| Infra | Infra | Docker Compose, Nginx, PostgreSQL, Redis | Orquestacion y persistencia |

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

## Uso de SDK

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

## Mas detalles

Consulta la guia completa en ingles en [README.md](README.md).
