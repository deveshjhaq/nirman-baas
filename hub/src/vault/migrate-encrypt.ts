import { pool, encryptCredentials } from './credentials';

/**
 * Migration script to encrypt existing plain text credentials
 * Run this once to encrypt all existing credentials in the database
 */
async function migrateCredentials() {
  console.log('Starting credentials encryption migration...');
  
  try {
    const result = await pool.query(`
      SELECT id, credentials 
      FROM integrations 
      WHERE credentials IS NOT NULL
    `);
    
    let encrypted = 0;
    let skipped = 0;
    
    for (const row of result.rows) {
      try {
        // Check if already encrypted (contains colons in expected format)
        if (typeof row.credentials === 'string' && row.credentials.includes(':')) {
          const parts = row.credentials.split(':');
          if (parts.length === 3) {
            console.log(`Skipping already encrypted credential ID: ${row.id}`);
            skipped++;
            continue;
          }
        }
        
        // Encrypt the credentials
        const encryptedCreds = encryptCredentials(row.credentials);
        
        await pool.query(
          'UPDATE integrations SET credentials = $1, updated_at = NOW() WHERE id = $2',
          [encryptedCreds, row.id]
        );
        
        encrypted++;
        console.log(`Encrypted credential ID: ${row.id}`);
      } catch (err) {
        console.error(`Failed to encrypt credential ID ${row.id}:`, err);
      }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`Encrypted: ${encrypted}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${result.rows.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrateCredentials().catch(console.error);
