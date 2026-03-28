-- 001_init_platform.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE provider_type AS ENUM ('otp', 'email', 'maps', 'notifications', 'storage', 'payment', 'sms');

CREATE TYPE log_status AS ENUM ('success', 'failure', 'pending', 'timeout');

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

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,
    name VARCHAR(100) NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['all'],
    rate_limit_per_min INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_api_keys_project ON api_keys(project_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

CREATE TABLE IF NOT EXISTS webhook_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url VARCHAR(2048) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INT DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_webhooks_project ON webhook_configs(project_id);

INSERT INTO users (email, password_hash, full_name, is_verified, is_admin)
VALUES ('admin@nirman.dev', crypt('admin123', gen_salt('bf')), 'Nirman Admin', TRUE, TRUE) 
ON CONFLICT (email) DO NOTHING;
