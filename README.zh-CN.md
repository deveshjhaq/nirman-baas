# Nirman (简体中文)

![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8)
![Bun](https://img.shields.io/badge/Bun-Latest-black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

Nirman 是一个面向现代应用的开源 Backend-as-a-Service (BaaS) 平台，采用多语言微服务架构。

## 核心功能

- 身份认证与 API Key 访问
- 实时通信（WebSocket + Redis Pub/Sub）
- 后台任务处理（Python + Celery）
- 可插拔集成（OTP、Email、Maps、Notifications、Storage、Payments、AI）
- 基于 Docker Compose 的自托管部署

## 架构与技术栈

| 层 | 服务 | 技术栈 | 作用 |
|---|---|---|---|
| API 层 | Gateway | Go, Chi, PostgreSQL, Redis | 认证、项目 API、API key 校验、代理路由 |
| 集成层 | Hub | Bun, Hono, TypeScript | 提供商适配与集成执行 |
| 异步层 | Workers | Python, Celery, Redis | 后台任务、重试、定时清理 |
| 实时层 | Realtime | Go, WebSockets, Redis Pub/Sub | 项目级实时通道 |
| UI 层 | Dashboard | Next.js, React, TypeScript | 管理控制台 |
| 基础设施层 | Infra | Docker Compose, Nginx, PostgreSQL, Redis | 编排与持久化 |

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

## SDK 示例

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

## 更多信息

完整英文文档请查看 [README.md](README.md)。
