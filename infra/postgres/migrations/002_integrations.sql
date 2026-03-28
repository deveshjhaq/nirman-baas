-- 002_integrations.sql
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'pending_setup');

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_category provider_type NOT NULL,
    credentials JSONB NOT NULL DEFAULT '{}',
    config JSONB DEFAULT '{}',
    status integration_status DEFAULT 'pending_setup',
    is_default BOOLEAN DEFAULT FALSE,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_integrations_project ON integrations(project_id);
CREATE INDEX idx_integrations_provider ON integrations(provider_category);
CREATE UNIQUE INDEX idx_integrations_default ON integrations(project_id, provider_category) WHERE is_default = TRUE;

CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    provider_category provider_type NOT NULL,
    action VARCHAR(100) NOT NULL,
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
