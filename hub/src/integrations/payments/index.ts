import { Hono } from 'hono';
import { getProvider } from '../../registry/providers';
import { getCredentials } from '../../vault/credentials';

const payments = new Hono();

payments.post('/create-order', async (c) => {
  const projectId = c.req.header('X-Project-ID')!;
  const body = await c.req.json();

  const creds = await getCredentials(projectId, 'payments');
  const provider = getProvider('payments', creds.provider);

  const result = await provider.execute('create_order', body, creds.config);
  return c.json(result);
});

payments.post('/verify', async (c) => {
  const projectId = c.req.header('X-Project-ID')!;
  const body = await c.req.json();

  const creds = await getCredentials(projectId, 'payments');
  const provider = getProvider('payments', creds.provider);

  const result = await provider.execute('verify', body, creds.config);
  return c.json(result);
});

export default payments;
