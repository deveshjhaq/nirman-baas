# Nirman (简体中文)

Nirman 是一个面向现代应用的开源 Backend-as-a-Service (BaaS) 平台。

## 核心功能

- 身份认证与 API Key 访问
- 实时通信（WebSocket + Redis Pub/Sub）
- 后台任务处理（Python + Celery）
- 可插拔集成（OTP、Email、Maps、Notifications、Storage、Payments、AI）
- 基于 Docker Compose 的自托管部署

## 技术栈

- Gateway: Go + Chi
- Hub: Bun + Hono
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: PostgreSQL + Redis + Nginx + Docker Compose

## 快速开始

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build -d
```

## 默认地址

- Dashboard: http://localhost:3001
- Gateway: http://localhost:8080
- Hub: http://localhost:3000
- Realtime: ws://localhost:8000

## 更多信息

完整说明请查看 [README.md](README.md)。
