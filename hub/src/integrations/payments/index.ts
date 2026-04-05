import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers';

const payments = new Hono();

payments.post('/create-order', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'payments');
    const result = await provider.execute('create_order', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

payments.post('/verify', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'payments');
    const result = await provider.execute('verify', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default payments;
