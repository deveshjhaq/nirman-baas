import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers.ts';

const otpRoutes = new Hono();

// Send OTP
otpRoutes.post('/send', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();
  if (!body.phone) {
    return c.json({ error: 'Phone number is required' }, 400);
  }

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'otp');
    const result = await provider.execute('send', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Verify OTP
otpRoutes.post('/verify', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();
  if (!body.phone || !body.code) {
    return c.json({ error: 'Phone number and code are required' }, 400);
  }

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'otp');
    const result = await provider.execute('verify', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default otpRoutes;
