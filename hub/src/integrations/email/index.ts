import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers.ts';

const emailRoutes = new Hono();

// Send Email
// Body expected: { to: "email@address", subject: "Hi", html: "<p>yo</p>" }
emailRoutes.post('/send', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const body = await c.req.json();
  if (!body.to || !body.subject || !body.html) {
    return c.json({ error: 'Missing to, subject, or html' }, 400);
  }

  try {
    const { provider, credentials } = await getProviderAdapter(projectId, 'email');
    const result = await provider.execute('send', body, credentials);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default emailRoutes;
