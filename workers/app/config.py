import os

# Worker Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DB_URL = os.getenv("DB_URL", "postgresql://nirman:nirmanpassword@localhost:5432/nirman_baas")

# Celery settings
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

# Task settings
TASK_MAX_RETRIES = 3
TASK_RETRY_DELAY = 60  # seconds

# Webhook settings
WEBHOOK_TIMEOUT = 10  # seconds
WEBHOOK_MAX_RETRIES = 3

# Cleanup settings
LOG_RETENTION_DAYS = 30
EXPIRED_KEY_CLEANUP_INTERVAL = 3600  # 1 hour
