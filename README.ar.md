# Nirman (العربية)

![License](https://img.shields.io/badge/license-BSD%203--Clause-blue)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8)
![Bun](https://img.shields.io/badge/Bun-Latest-black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

Nirman هي منصة Backend-as-a-Service (BaaS) مفتوحة المصدر، مبنية على معمارية خدمات متعددة بلغات مختلفة.

## الميزات الرئيسية

- المصادقة والوصول عبر API key
- تحديثات فورية (WebSocket + Redis Pub/Sub)
- مهام خلفية (Python + Celery)
- تكاملات قابلة للتبديل (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- استضافة ذاتية باستخدام Docker Compose

## المعمارية والتقنيات

| الطبقة | الخدمة | التقنيات | الهدف |
|---|---|---|---|
| API | Gateway | Go, Chi, PostgreSQL, Redis | المصادقة، واجهات المشاريع، التحقق من API key، التوجيه |
| التكاملات | Hub | Bun, Hono, TypeScript | تشغيل التكاملات وتبديل المزودين |
| المهام غير المتزامنة | Workers | Python, Celery, Redis | مهام الخلفية وإعادة المحاولة والتنظيف الدوري |
| الوقت الحقيقي | Realtime | Go, WebSockets, Redis Pub/Sub | قنوات لحظية على مستوى المشروع |
| الواجهة | Dashboard | Next.js, React, TypeScript | لوحة الإدارة |
| البنية التحتية | Infra | Docker Compose, Nginx, PostgreSQL, Redis | orchestration والتخزين |

## البدء السريع

```bash
git clone https://github.com/deveshjhaq/nirman-baas.git
cd nirman-baas
npm install
docker compose up --build -d
```

## الروابط الافتراضية

- Dashboard: http://localhost:3001
- Gateway: http://localhost:8080
- Hub: http://localhost:3000
- Realtime: ws://localhost:8000

## أمثلة SDK

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

## مزيد من التفاصيل

للاطلاع على الدليل الكامل بالإنجليزية، راجع [README.md](README.md).
