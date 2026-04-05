import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers.ts';

const storageRoutes = new Hono();

storageRoutes.post('/presign', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();
  if (!body.fileName || !body.contentType) {
    return c.json({ error: 'Missing fileName or contentType' }, 400);
  }

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'storage');
    const result = await provider.execute('presign', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default storageRoutes;
