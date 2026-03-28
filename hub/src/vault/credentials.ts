import { Pool } from 'pg';

const DB_URL = process.env.DB_URL || 'postgres://nirman:nirmanpassword@localhost:5432/nirman_baas?sslmode=disable';

export const pool = new Pool({
  connectionString: DB_URL,
  max: 20,
});

pool.on('error', (err) => {
  console.error('[Hub DB] Unexpected error on idle client', err);
});

export async function getProviderCredentials(projectId: string, category: string, specificProvider?: string) {
  let query = `
    SELECT provider, credentials, config 
    FROM integrations 
    WHERE project_id = $1 AND provider_category = $2 AND status = 'active'
  `;
  const params: any[] = [projectId, category];

  if (specificProvider) {
    query += ` AND provider = $3`;
    params.push(specificProvider);
  } else {
    query += ` AND is_default = TRUE`;
  }

  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    throw new Error(`No active provider found for category '${category}'`);
  }

  return {
    providerName: result.rows[0].provider,
    credentials: result.rows[0].credentials,
    config: result.rows[0].config,
  };
}
