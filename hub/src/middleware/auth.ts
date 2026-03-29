import type { Context, Next } from 'hono';

/**
 * Internal-only middleware — ensures requests come from the Gateway (via X-Project-ID header).
 * This is NOT public-facing auth; the Gateway handles JWT/API Key validation before proxying here.
 */
export async function internalAuth(c: Context, next: Next) {
  const projectId = c.req.header('X-Project-ID');

  if (!projectId) {
    return c.json({ error: 'Forbidden: Missing internal project context. Requests must come through the Gateway.' }, 403);
  }

  // Optionally validate project exists in DB for extra safety
  await next();
}
