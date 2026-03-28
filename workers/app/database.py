import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import DB_URL


def get_connection():
    """Get a database connection"""
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)


def update_task_status(task_db_id, status, result=None, error=None):
    """Update the status of a task in the database"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if status == "processing":
                cur.execute(
                    """UPDATE tasks SET status = %s, started_at = NOW(), 
                       attempts = attempts + 1 WHERE id = %s""",
                    (status, task_db_id)
                )
            elif status == "completed":
                cur.execute(
                    """UPDATE tasks SET status = %s, completed_at = NOW(), 
                       result = %s WHERE id = %s""",
                    (status, psycopg2.extras.Json(result), task_db_id)
                )
            elif status == "failed":
                cur.execute(
                    """UPDATE tasks SET status = %s, completed_at = NOW(),
                       result = %s WHERE id = %s""",
                    (status, psycopg2.extras.Json({"error": str(error)}), task_db_id)
                )
            else:
                cur.execute(
                    "UPDATE tasks SET status = %s WHERE id = %s",
                    (status, task_db_id)
                )
            conn.commit()
    finally:
        conn.close()


def get_webhook_configs(project_id, event):
    """Get active webhook configs for a project and event type"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id, url, secret, retry_count 
                   FROM webhook_configs 
                   WHERE project_id = %s AND is_active = TRUE AND %s = ANY(events)""",
                (project_id, event)
            )
            return cur.fetchall()
    finally:
        conn.close()


def log_integration_event(project_id, provider, category, action, status, details=None):
    """Log an integration event"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO integration_logs 
                   (project_id, provider, provider_category, action, status, response_body)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (project_id, provider, category, action, status,
                 psycopg2.extras.Json(details) if details else None)
            )
            conn.commit()
    finally:
        conn.close()
