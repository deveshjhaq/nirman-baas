from app.celery import app
from app.database import get_connection
from app.config import LOG_RETENTION_DAYS


@app.task
def cleanup_old_logs():
    """
    Periodic task: Remove integration logs older than retention period.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """DELETE FROM integration_logs 
                   WHERE created_at < NOW() - INTERVAL '%s days'
                   RETURNING id""",
                (LOG_RETENTION_DAYS,)
            )
            deleted = cur.rowcount
            conn.commit()
            
            result = {
                "task": "cleanup_old_logs",
                "deleted_logs": deleted,
                "retention_days": LOG_RETENTION_DAYS,
            }
            print(f"[CLEANUP] Deleted {deleted} old log entries")
            return result
    finally:
        conn.close()


@app.task
def cleanup_expired_api_keys():
    """
    Periodic task: Deactivate expired API keys.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE api_keys 
                   SET is_active = FALSE 
                   WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = TRUE
                   RETURNING id"""
            )
            deactivated = cur.rowcount
            conn.commit()
            
            result = {
                "task": "cleanup_expired_api_keys",
                "deactivated_keys": deactivated,
            }
            print(f"[CLEANUP] Deactivated {deactivated} expired API keys")
            return result
    finally:
        conn.close()


@app.task
def cleanup_completed_tasks():
    """
    Periodic task: Remove completed/failed tasks older than 7 days.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """DELETE FROM tasks 
                   WHERE status IN ('completed', 'failed') 
                   AND created_at < NOW() - INTERVAL '7 days'
                   RETURNING id"""
            )
            deleted = cur.rowcount
            conn.commit()
            
            result = {
                "task": "cleanup_completed_tasks",
                "deleted_tasks": deleted,
            }
            print(f"[CLEANUP] Deleted {deleted} old task records")
            return result
    finally:
        conn.close()
