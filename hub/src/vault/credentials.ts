import { Pool } from 'pg';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const DB_URL = process.env.DB_URL || 'postgres://nirman:nirmanpassword@localhost:5432/nirman_baas?sslmode=disable';
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || 'default-key-change-in-production';

export const pool = new Pool({
  connectionString: DB_URL,
  max: 20,
});

pool.on('error', (err) => {
  console.error('[Hub DB] Unexpected error on idle client', err);
});

// Derive a 32-byte key from the encryption key
function getDerivedKey(): Buffer {
  return scryptSync(ENCRYPTION_KEY, 'salt', 32);
}

// Encrypt credentials using AES-256-GCM
export function encryptCredentials(data: any): string {
  const key = getDerivedKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  const plaintext = JSON.stringify(data);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Decrypt credentials
export function decryptCredentials(encryptedData: string): any {
  const key = getDerivedKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

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

  // Decrypt credentials before returning
  const encryptedCredentials = result.rows[0].credentials;
  const decryptedCredentials = typeof encryptedCredentials === 'string' 
    ? decryptCredentials(encryptedCredentials)
    : encryptedCredentials; // Fallback for legacy unencrypted data

  return {
    providerName: result.rows[0].provider,
    credentials: decryptedCredentials,
    config: result.rows[0].config,
  };
}

export async function saveProviderCredentials(
  projectId: string,
  category: string,
  provider: string,
  credentials: any,
  config?: any,
  isDefault: boolean = false
): Promise<void> {
  const encryptedCredentials = encryptCredentials(credentials);
  
  const query = `
    INSERT INTO integrations (project_id, provider_category, provider, credentials, config, is_default, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'active')
    ON CONFLICT (project_id, provider_category, provider)
    DO UPDATE SET 
      credentials = EXCLUDED.credentials,
      config = EXCLUDED.config,
      is_default = EXCLUDED.is_default,
      updated_at = NOW()
  `;
  
  await pool.query(query, [
    projectId,
    category,
    provider,
    encryptedCredentials,
    config ? JSON.stringify(config) : null,
    isDefault
  ]);
}
