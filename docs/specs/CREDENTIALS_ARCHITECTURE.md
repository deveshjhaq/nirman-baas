# Credentials Architecture

## Overview

Nirman BaaS uses a secure, encrypted credential storage system where sensitive API keys and credentials are never stored in plain text.

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Gateway   │────────▶│     Hub     │────────▶│  Database   │
│   (Go/Chi)  │         │  (Bun/Hono) │         │ (Postgres)  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │                       │                        │
   Metadata              Encryption              Encrypted Data
   (provider,            (AES-256-GCM)          (iv:tag:cipher)
    category,
    config)
```

## Data Flow

### Creating an Integration

1. User sends credentials to Gateway via API
2. Gateway forwards credentials to Hub's `/internal/vault/credentials` endpoint
3. Hub encrypts credentials using AES-256-GCM
4. Hub stores encrypted credentials in database
5. Gateway stores only metadata (provider, category, config, status)

### Using an Integration

1. Application makes request to Hub with `X-Project-ID` header
2. Hub fetches encrypted credentials from database
3. Hub decrypts credentials automatically
4. Hub passes decrypted credentials to provider adapter
5. Provider executes action with credentials

## Security Features

### Encryption

- Algorithm: AES-256-GCM (Galois/Counter Mode)
- Key derivation: scrypt with salt
- IV: Random 16 bytes per encryption (prevents pattern analysis)
- Auth tag: 16 bytes for integrity verification
- Format: `iv:authTag:encryptedData` (hex encoded)

### Key Management

- Encryption key stored in environment variable: `VAULT_ENCRYPTION_KEY`
- Different keys for dev/staging/production
- Keys never committed to version control
- Recommended: Use secret management service (AWS Secrets Manager, HashiCorp Vault)

### Data Separation

- Gateway DB: Metadata only (no credentials)
- Hub DB: Encrypted credentials only
- Even with database access, credentials are unreadable without encryption key

## Environment Setup

### Required Environment Variables

```bash
# Hub service
VAULT_ENCRYPTION_KEY=your-secure-random-key-min-32-chars
```

### Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration

For existing deployments with plain text credentials:

```bash
cd hub
bun run src/vault/migrate-encrypt.ts
```

This will:
- Detect unencrypted credentials
- Encrypt them using current `VAULT_ENCRYPTION_KEY`
- Update database with encrypted format
- Skip already encrypted credentials

## API Endpoints

### Internal (Gateway → Hub)

#### Store Credentials
```http
POST /internal/vault/credentials
X-Project-ID: project-123
Content-Type: application/json

{
  "projectId": "project-123",
  "category": "email",
  "provider": "sendgrid",
  "credentials": {
    "apiKey": "SG.xxx"
  },
  "config": {
    "fromEmail": "noreply@example.com"
  },
  "isDefault": true
}
```

#### Update Credentials
```http
PUT /internal/vault/credentials
X-Project-ID: project-123
Content-Type: application/json

{
  "projectId": "project-123",
  "category": "email",
  "provider": "sendgrid",
  "credentials": {
    "apiKey": "SG.new-key"
  },
  "config": {
    "fromEmail": "noreply@example.com"
  },
  "isDefault": true
}
```

## Database Schema

### Gateway: integrations table
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_category VARCHAR(50) NOT NULL,
  config JSONB,                    -- Non-sensitive config only
  status VARCHAR(20),
  is_default BOOLEAN,
  last_tested_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
  -- NO credentials column
);
```

### Hub: integrations table
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_category VARCHAR(50) NOT NULL,
  credentials TEXT NOT NULL,       -- Encrypted: iv:tag:cipher
  config JSONB,
  status VARCHAR(20),
  is_default BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Best Practices

1. **Key Rotation**: Rotate encryption keys periodically
2. **Backup Keys**: Securely backup encryption keys (lost key = lost credentials)
3. **Access Control**: Limit who can access `VAULT_ENCRYPTION_KEY`
4. **Audit Logs**: Log credential access for security monitoring
5. **Secret Management**: Use dedicated secret management services in production
6. **Network Security**: Hub's vault endpoints should only be accessible from Gateway

## Troubleshooting

### Error: "Invalid encrypted data format"

- Credentials in database are not in expected `iv:tag:cipher` format
- Run migration script to encrypt existing plain text credentials

### Error: "Failed to decrypt credentials"

- Wrong `VAULT_ENCRYPTION_KEY` being used
- Credentials were encrypted with different key
- Verify environment variable is set correctly

### Error: "Failed to call hub vault endpoint"

- Hub service is not running
- `HUB_URL` environment variable incorrect in Gateway
- Network connectivity issue between Gateway and Hub
