import httpx
from app.celery import app
from app.database import update_task_status, log_integration_event
from app.config import TASK_MAX_RETRIES


@app.task(bind=True, max_retries=TASK_MAX_RETRIES)
def send_batch_notifications(self, project_id, notifications, task_db_id=None):
    """
    Send batch push notifications asynchronously.
    
    Args:
        project_id: The project ID
        notifications: List of dicts with {device_token, title, body, data}
        task_db_id: Optional task ID for tracking
    """
    if task_db_id:
        update_task_status(task_db_id, "processing")

    HUB_URL = "http://integrations-hub:3000"
    results = []

    try:
        with httpx.Client(timeout=30) as client:
            for i, notif in enumerate(notifications):
                try:
                    response = client.post(
                        f"{HUB_URL}/internal/notifications/push",
                        json={
                            "project_id": project_id,
                            "device_token": notif.get("device_token"),
                            "title": notif.get("title"),
                            "body": notif.get("body"),
                            "data": notif.get("data", {}),
                            "image_url": notif.get("image_url"),
                        },
                        headers={
                            "Content-Type": "application/json",
                            "X-Project-ID": project_id,
                        },
                    )

                    result = response.json()
                    results.append({
                        "index": i,
                        "device_token": notif.get("device_token", "")[:20] + "...",
                        "success": result.get("success", False),
                    })

                except Exception as e:
                    results.append({
                        "index": i,
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
            project_id, "batch_notifications", "notifications",
            "notifications.batch_push", "success", final_result
        )

        return final_result

    except Exception as e:
        if task_db_id:
            update_task_status(task_db_id, "failed", error=str(e))
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))
