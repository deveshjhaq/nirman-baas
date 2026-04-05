# Secure Credentials Setup Guide

Quick guide to set up encrypted credential storage in Nirman BaaS.

## Step 1: Generate Encryption Key

```bash
# Generate a secure 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Step 2: Set Environment Variable

### Development (Local)

Create `.env` file in hub directory:
```bash
cd hub
echo "VAULT_ENCRYPTION_KEY=your-generated-key-here" >> .env
```

### Production (Docker)

Update `docker-compose.yml`:
```yaml
services:
  hub:
    environment:
      - VAULT_ENCRYPTION_KEY=${VAULT_ENCRYPTION_KEY}
```

Then set in your shell before running docker-compose:
```bash
export VAULT_ENCRYPTION_KEY=your-generated-key-here
docker-compose up -d
```

### Production (Kubernetes)

Create a secret:
```bash
kubectl create secret generic vault-encryption-key \
  --from-literal=key=your-generated-key-here
```

Reference in deployment:
```yaml
env:
  - name: VAULT_ENCRYPTION_KEY
    valueFrom:
      secretKeyRef:
        name: vault-encryption-key
        key: key
```

## Step 3: Migrate Existing Credentials (If Any)

If you have existing plain text credentials in the database:

```bash
cd hub
bun run src/vault/migrate-encrypt.ts
```

Expected output:
```
Starting credentials encryption migration...
Encrypted credential ID: abc-123
Encrypted credential ID: def-456
Skipping already encrypted credential ID: ghi-789

Migration complete!
Encrypted: 2
Skipped: 1
Total: 3
```

## Step 4: Verify Setup

### Test Encryption

```bash
curl -X POST http://localhost:3000/internal/vault/credentials \
  -H "Content-Type: application/json" \
  -H "X-Project-ID: test-project" \
  -d '{
    "projectId": "test-project",
    "category": "email",
    "provider": "sendgrid",
    "credentials": {
      "apiKey": "test-key-123"
    },
    "isDefault": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Credentials encrypted and stored successfully"
}
```

### Verify in Database

```sql
SELECT project_id, provider, 
       LEFT(credentials, 50) as encrypted_preview 
FROM integrations 
WHERE project_id = 'test-project';
```

Should show encrypted format:
```
project_id   | provider  | encrypted_preview
-------------|-----------|------------------------------------------
test-project | sendgrid  | a1b2c3d4e5f6:1234567890ab:cdef01234567...
```

## Step 5: Update Gateway Configuration

Ensure Gateway can reach Hub:

```bash
# In gateway/.env or docker-compose.yml
HUB_URL=http://hub:3000
```

## Security Checklist

- [ ] Generated strong encryption key (32+ bytes)
- [ ] Set `VAULT_ENCRYPTION_KEY` in environment
- [ ] Never committed encryption key to git
- [ ] Migrated existing plain text credentials
- [ ] Verified encrypted format in database
- [ ] Backed up encryption key securely
- [ ] Different keys for dev/staging/production
- [ ] Restricted access to encryption key
- [ ] Documented key location for team

## Common Issues

### Issue: "VAULT_ENCRYPTION_KEY not set"

**Solution**: Set the environment variable before starting Hub service.

```bash
export VAULT_ENCRYPTION_KEY=your-key-here
```

### Issue: "Invalid encrypted data format"

**Solution**: Run migration script to encrypt existing credentials.

```bash
cd hub
bun run src/vault/migrate-encrypt.ts
```

### Issue: "Failed to call hub vault endpoint"

**Solution**: Check Hub service is running and Gateway can reach it.

```bash
# Test Hub health
curl http://localhost:3000/health

# Check Gateway HUB_URL config
echo $HUB_URL
```

## Key Rotation (Advanced)

To rotate encryption keys:

1. Generate new key
2. Decrypt all credentials with old key
3. Re-encrypt with new key
4. Update `VAULT_ENCRYPTION_KEY`
5. Restart services

Script coming soon: `hub/src/vault/rotate-key.ts`

## Next Steps

- Set up secret management service (AWS Secrets Manager, etc.)
- Configure audit logging for credential access
- Set up monitoring alerts for failed decryption attempts
- Document key backup and recovery procedures
