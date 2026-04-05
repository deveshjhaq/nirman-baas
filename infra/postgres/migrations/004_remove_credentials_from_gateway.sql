-- Migration: Remove credentials column from gateway's integrations table
-- Credentials are now stored encrypted in Hub's database only
-- Gateway only stores metadata (provider, category, config, status)

BEGIN;

-- Remove credentials column from integrations table
-- This is safe because credentials are now managed by Hub's vault
ALTER TABLE integrations DROP COLUMN IF EXISTS credentials;

-- Add comment to table explaining the architecture
COMMENT ON TABLE integrations IS 'Integration metadata stored in Gateway. Credentials are encrypted and stored in Hub vault.';

COMMIT;
