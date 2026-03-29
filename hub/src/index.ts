import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { internalAuth } from './middleware/auth.ts';

// Integration Routers
import otpRoutes from './integrations/otp/index.ts';
import emailRoutes from './integrations/email/index.ts';
import mapsRoutes from './integrations/maps/index.ts';
import notificationRoutes from './integrations/notifications/index.ts';
import storageRoutes from './integrations/storage/index.ts';
import paymentRoutes from './integrations/payments/index.ts';
import aiRoutes from './integrations/ai/index.ts';

const app = new Hono();

// Middleware
app.use('*', logger());

// Health Check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'Nirman Integrations Hub', version: '2.0.0' });
});

// All internal routes require X-Project-ID from Gateway
const internal = new Hono();
internal.use('*', internalAuth);

// Mount all integration domains
internal.route('/otp', otpRoutes);
internal.route('/email', emailRoutes);
internal.route('/maps', mapsRoutes);
internal.route('/notifications', notificationRoutes);
internal.route('/storage', storageRoutes);
internal.route('/payments', paymentRoutes);
internal.route('/ai', aiRoutes);

// Register internal proxy router
app.route('/internal', internal);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
