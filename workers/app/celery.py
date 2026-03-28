from celery import Celery
from celery.schedules import crontab
from app.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

app = Celery(
    "nirman_workers",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.email_task",
        "app.tasks.webhook_task",
        "app.tasks.notification_task",
        "app.tasks.cleanup_task",
    ]
)

# Celery configuration
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,  # Tasks are acknowledged after execution (more reliable)
    worker_prefetch_multiplier=1,
)

# Periodic tasks (Celery Beat schedule)
app.conf.beat_schedule = {
    "cleanup-old-logs-daily": {
        "task": "app.tasks.cleanup_task.cleanup_old_logs",
        "schedule": crontab(hour=2, minute=0),  # 2:00 AM UTC daily
    },
    "cleanup-expired-keys-hourly": {
        "task": "app.tasks.cleanup_task.cleanup_expired_api_keys",
        "schedule": crontab(minute=0),  # Every hour
    },
    "cleanup-old-tasks-daily": {
        "task": "app.tasks.cleanup_task.cleanup_completed_tasks",
        "schedule": crontab(hour=3, minute=0),  # 3:00 AM UTC daily
    },
}
