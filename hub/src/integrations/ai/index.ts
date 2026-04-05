import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers';

const ai = new Hono();

ai.post('/generate', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'ai');
    const result = await provider.execute('generate', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

ai.post('/embed', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'ai');
    const result = await provider.execute('embed', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default ai;
