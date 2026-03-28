import httpx
from app.celery import app
from app.database import update_task_status, log_integration_event
from app.config import TASK_MAX_RETRIES


@app.task(bind=True, max_retries=TASK_MAX_RETRIES)
def send_bulk_email(self, project_id, emails, task_db_id=None):
    """
    Send bulk emails asynchronously via the Integrations Hub.
    
    Args:
        project_id: The project ID
        emails: List of dicts with {to, subject, body, html}
        task_db_id: Optional task ID for tracking
    """
    if task_db_id:
        update_task_status(task_db_id, "processing")

    HUB_URL = "http://integrations-hub:3000"
    results = []

    try:
        with httpx.Client(timeout=30) as client:
            for i, email in enumerate(emails):
                try:
                    response = client.post(
                        f"{HUB_URL}/internal/email/send",
                        json={
                            "project_id": project_id,
                            "to": email.get("to"),
                            "subject": email.get("subject"),
                            "body": email.get("body", ""),
                            "html": email.get("html"),
                        },
                        headers={
                            "Content-Type": "application/json",
                            "X-Project-ID": project_id,
                        },
                    )

                    result = response.json()
                    results.append({
                        "index": i,
                        "to": email.get("to"),
                        "success": result.get("success", False),
                        "status_code": response.status_code,
                    })

                except Exception as e:
                    results.append({
                        "index": i,
                        "to": email.get("to"),
                        "success": False,
                        "error": str(e),
                    })

        total = len(results)
        successful = len([r for r in results if r.get("success")])
        
        final_result = {
            "total": total,
            "successful": successful,
            "failed": total - successful,
            "results": results,
        }

        if task_db_id:
            update_task_status(task_db_id, "completed", result=final_result)

        log_integration_event(
            project_id, "bulk_email", "email",
            "email.bulk_send", "success", final_result
        )

        return final_result

    except Exception as e:
        if task_db_id:
            update_task_status(task_db_id, "failed", error=str(e))
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@app.task(bind=True, max_retries=TASK_MAX_RETRIES)
def send_scheduled_email(self, project_id, email_data, task_db_id=None):
    """
    Send a single scheduled email via the Integrations Hub.
    """
    if task_db_id:
        update_task_status(task_db_id, "processing")

    HUB_URL = "http://integrations-hub:3000"

    try:
        with httpx.Client(timeout=30) as client:
            response = client.post(
                f"{HUB_URL}/internal/email/send",
                json={
                    "project_id": project_id,
                    **email_data,
                },
                headers={
                    "Content-Type": "application/json",
                    "X-Project-ID": project_id,
                },
            )

            result = response.json()

            if task_db_id:
                status = "completed" if result.get("success") else "failed"
                update_task_status(task_db_id, status, result=result)

            return result

    except Exception as e:
        if task_db_id:
            update_task_status(task_db_id, "failed", error=str(e))
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))
