# Credentials Vault

Secure credential storage with AES-256-GCM encryption for API keys and sensitive data.

## Features

- AES-256-GCM encryption for all credentials
- Automatic encryption/decryption on save/retrieve
- Migration support for existing plain text credentials
- Environment-based encryption key management

## Setup

### 1. Set Encryption Key

Production mein strong encryption key set karein:

```bash
export VAULT_ENCRYPTION_KEY="your-secure-random-key-min-32-chars"
```

Key generate karne ke liye:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Migrate Existing Credentials (One-time)

Agar database mein pehle se plain text credentials hain:

```bash
cd hub
bun run src/vault/migrate-encrypt.ts
```

## Usage

### Save Encrypted Credentials

```typescript
import { saveProviderCredentials } from './vault/credentials';

await saveProviderCredentials(
  'project-123',
  'email',
  'sendgrid',
  { apiKey: 'SG.xxx' },
  { fromEmail: 'noreply@example.com' },
  true
);
```

### Retrieve Decrypted Credentials

```typescript
import { getProviderCredentials } from './vault/credentials';

const { credentials } = await getProviderCredentials(
  'project-123',
  'email',
  'sendgrid'
);

// credentials automatically decrypted
console.log(credentials.apiKey);
```

## Security Notes

- Never commit `VAULT_ENCRYPTION_KEY` to version control
- Use different keys for dev/staging/production
- Rotate encryption keys periodically
- Store keys in secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Backup encryption key securely - lost key = lost credentials

## Encryption Details

- Algorithm: AES-256-GCM
- Key derivation: scrypt with salt
- IV: Random 16 bytes per encryption
- Auth tag: 16 bytes for integrity verification
- Format: `iv:authTag:encryptedData` (hex encoded)
