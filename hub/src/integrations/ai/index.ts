import { Hono } from 'hono';
import { getProvider } from '../../registry/providers';
import { getCredentials } from '../../vault/credentials';

const ai = new Hono();

ai.post('/generate', async (c) => {
  const projectId = c.req.header('X-Project-ID')!;
  const body = await c.req.json();

  const creds = await getCredentials(projectId, 'ai');
  const provider = getProvider('ai', creds.provider);

  const result = await provider.execute('generate', body, creds.config);
  return c.json(result);
});

ai.post('/embed', async (c) => {
  const projectId = c.req.header('X-Project-ID')!;
  const body = await c.req.json();

  const creds = await getCredentials(projectId, 'ai');
  const provider = getProvider('ai', creds.provider);

  const result = await provider.execute('embed', body, creds.config);
  return c.json(result);
});

export default ai;
