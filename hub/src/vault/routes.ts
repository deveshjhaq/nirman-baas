import { Hono } from 'hono';
import { saveProviderCredentials } from './credentials';

const vaultRoutes = new Hono();

/**
 * Internal endpoint for gateway to store encrypted credentials
 * POST /vault/credentials
 */
vaultRoutes.post('/credentials', async (c) => {
  try {
    const body = await c.req.json();
    
    const { projectId, category, provider, credentials, config, isDefault } = body;
    
    if (!projectId || !category || !provider || !credentials) {
      return c.json({ 
        error: 'Missing required fields: projectId, category, provider, credentials' 
      }, 400);
    }

    await saveProviderCredentials(
      projectId,
      category,
      provider,
      credentials,
      config,
      isDefault || false
    );

    return c.json({ 
      success: true,
      message: 'Credentials encrypted and stored successfully' 
    });
  } catch (error: any) {
    console.error('[Vault] Failed to store credentials:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Internal endpoint to update encrypted credentials
 * PUT /vault/credentials
 */
vaultRoutes.put('/credentials', async (c) => {
  try {
    const body = await c.req.json();
    
    const { projectId, category, provider, credentials, config, isDefault } = body;
    
    if (!projectId || !category || !provider) {
      return c.json({ 
        error: 'Missing required fields: projectId, category, provider' 
      }, 400);
    }

    await saveProviderCredentials(
      projectId,
      category,
      provider,
      credentials,
      config,
      isDefault || false
    );

    return c.json({ 
      success: true,
      message: 'Credentials updated and encrypted successfully' 
    });
  } catch (error: any) {
    console.error('[Vault] Failed to update credentials:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default vaultRoutes;
