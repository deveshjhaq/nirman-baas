-- Nirman BaaS — Database Schema
-- Full schema for the plug-and-play Backend-as-a-Service platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE provider_type AS ENUM (
    'otp',
    'email',
    'maps',
    'notifications',
    'storage',
    'payment',
    'sms'
);

CREATE TYPE integration_status AS ENUM (
    'active',
    'inactive',
    'error',
    'pending_setup'
);

CREATE TYPE log_status AS ENUM (
    'success',
    'failure',
    'pending',
    'timeout'
);

CREATE TYPE task_status AS ENUM (
    'queued',
    'processing',
    'completed',
    'failed',
    'retrying'
);

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_user ON projects(user_id);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,           -- e.g., 'twilio', 'sendgrid', 'google_maps'
    provider_category provider_type NOT NULL, -- otp, email, maps, etc.
    credentials JSONB NOT NULL DEFAULT '{}',  -- encrypted API keys, tokens
    config JSONB DEFAULT '{}',               -- provider-specific settings (sender ID, etc.)
    status integration_status DEFAULT 'pending_setup',
    is_default BOOLEAN DEFAULT FALSE,        -- default provider for this category
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integrations_project ON integrations(project_id);
CREATE INDEX idx_integrations_provider ON integrations(provider_category);
-- Ensure only one default per category per project
CREATE UNIQUE INDEX idx_integrations_default 
    ON integrations(project_id, provider_category) 
    WHERE is_default = TRUE;

-- ============================================
-- API KEYS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,          -- hashed API key (we never store raw)
    key_prefix VARCHAR(12) NOT NULL,         -- first 8 chars for identification: "nk_xxxx..."
    name VARCHAR(100) NOT NULL,              -- human-friendly label
    scopes TEXT[] DEFAULT ARRAY['all'],      -- permission scopes
    rate_limit_per_min INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_project ON api_keys(project_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- ============================================
-- WEBHOOK CONFIGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url VARCHAR(2048) NOT NULL,
    events TEXT[] NOT NULL,                  -- e.g., {'otp.sent', 'email.delivered', 'email.bounced'}
    secret VARCHAR(255) NOT NULL,            -- webhook signing secret
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_project ON webhook_configs(project_id);

-- ============================================
-- INTEGRATION LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    provider_category provider_type NOT NULL,
    action VARCHAR(100) NOT NULL,            -- e.g., 'otp.send', 'email.send', 'maps.geocode'
    request_body JSONB,
    response_body JSONB,
    status log_status DEFAULT 'pending',
    status_code INT,
    latency_ms INT,
    error_message TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_project ON integration_logs(project_id);
CREATE INDEX idx_logs_created ON integration_logs(created_at DESC);
CREATE INDEX idx_logs_status ON integration_logs(status);
CREATE INDEX idx_logs_provider ON integration_logs(provider_category);

-- ============================================
-- BACKGROUND TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,         -- e.g., 'email.bulk_send', 'webhook.deliver', 'cleanup'
    celery_task_id VARCHAR(255),             -- Celery task ID for tracking
    payload JSONB NOT NULL DEFAULT '{}',
    result JSONB,
    status task_status DEFAULT 'queued',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_celery ON tasks(celery_task_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Create a default admin user (password: admin123 — change in production!)
INSERT INTO users (email, password_hash, full_name, is_verified, is_admin)
VALUES (
    'admin@nirman.dev',
    crypt('admin123', gen_salt('bf')),
    'Nirman Admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;
