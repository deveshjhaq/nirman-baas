import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers.ts';

const notificationRoutes = new Hono();

notificationRoutes.post('/send', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();
  if (!body.token || !body.title || !body.bodyText) {
    return c.json({ error: 'Missing token, title, or bodyText' }, 400);
  }

  try {
    const adapter: any = await getProviderAdapter(projectId, 'notifications');
    const result = await adapter.sendPush(body.token, body.title, body.bodyText, body.data);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default notificationRoutes;
