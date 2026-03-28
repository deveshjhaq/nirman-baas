import { Hono } from 'hono';
import { logger } from 'hono/logger';

// Integration Routers
import otpRoutes from './integrations/otp/index.ts';
import emailRoutes from './integrations/email/index.ts';
import mapsRoutes from './integrations/maps/index.ts';
import notificationRoutes from './integrations/notifications/index.ts';
import storageRoutes from './integrations/storage/index.ts';

const app = new Hono();

// Middleware
app.use('*', logger());

// Health Check
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'Integrations Hub' });
});

// Proxy logic mounts here
const internal = new Hono();

// Mount all integrations correctly into the hub
internal.route('/otp', otpRoutes);
internal.route('/email', emailRoutes);
internal.route('/maps', mapsRoutes);
internal.route('/notifications', notificationRoutes);
internal.route('/storage', storageRoutes);

// Register internal proxy router
app.route('/internal', internal);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
