import { Hono } from 'hono';
import { getProviderAdapter } from '../../registry/providers.ts';

const mapsRoutes = new Hono();

mapsRoutes.get('/geocode', async (c) => {
  const projectId = c.req.header('X-Project-ID');
  if (!projectId) return c.json({ error: 'X-Project-ID header required' }, 400);

  const address = c.req.query('address');
  if (!address) return c.json({ error: 'address query param required' }, 400);

  try {
    const adapter: any = await getProviderAdapter(projectId, 'maps');
    const result = await adapter.geocode(address);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default mapsRoutes;
