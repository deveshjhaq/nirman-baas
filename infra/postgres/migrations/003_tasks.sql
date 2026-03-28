-- 003_tasks.sql
CREATE TYPE task_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'retrying');

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    celery_task_id VARCHAR(255),
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
