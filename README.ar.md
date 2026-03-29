# Nirman (العربية)

Nirman هي منصة Backend-as-a-Service (BaaS) مفتوحة المصدر لتطوير التطبيقات الحديثة.

## الميزات الرئيسية

- المصادقة والوصول عبر API key
- تحديثات فورية (WebSocket + Redis Pub/Sub)
- مهام خلفية (Python + Celery)
- تكاملات قابلة للتبديل (OTP, Email, Maps, Notifications, Storage, Payments, AI)
- استضافة ذاتية باستخدام Docker Compose

## التقنيات المستخدمة

- Gateway: Go + Chi
- Hub: Bun + Hono
- Workers: Python + Celery
- Realtime: Go + WebSockets
- Dashboard: Next.js + TypeScript
- Infra: PostgreSQL + Redis + Nginx + Docker Compose

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

## مزيد من التفاصيل

للاطلاع على التوثيق الكامل، راجع [README.md](README.md).
