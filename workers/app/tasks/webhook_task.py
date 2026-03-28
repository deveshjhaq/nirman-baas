import hashlib
import hmac
import json
import time
import httpx
from app.celery import app
from app.database import get_webhook_configs, update_task_status, log_integration_event
from app.config import WEBHOOK_TIMEOUT, WEBHOOK_MAX_RETRIES


@app.task(bind=True, max_retries=WEBHOOK_MAX_RETRIES)
def deliver_webhook(self, project_id, event, payload, task_db_id=None):
    """
    Deliver a webhook event to all registered URLs for a project.
    
    Example events: 'otp.sent', 'otp.verified', 'email.delivered', 'email.bounced'
    """
    if task_db_id:
        update_task_status(task_db_id, "processing")

    try:
        webhooks = get_webhook_configs(project_id, event)
        
        if not webhooks:
            result = {"message": "No webhook configs found for this event", "event": event}
            if task_db_id:
                update_task_status(task_db_id, "completed", result=result)
            return result

        results = []
        
        for webhook in webhooks:
            try:
                # Sign the payload
                signature = hmac.new(
                    webhook["secret"].encode(),
                    json.dumps(payload).encode(),
                    hashlib.sha256
                ).hexdigest()

                # Deliver
                with httpx.Client(timeout=WEBHOOK_TIMEOUT) as client:
                    response = client.post(
                        webhook["url"],
                        json={
                            "event": event,
                            "payload": payload,
                            "timestamp": int(time.time()),
                        },
                        headers={
                            "Content-Type": "application/json",
                            "X-Nirman-Signature": f"sha256={signature}",
                            "X-Nirman-Event": event,
                        },
                    )

                results.append({
                    "webhook_id": str(webhook["id"]),
                    "url": webhook["url"],
                    "status_code": response.status_code,
                    "success": 200 <= response.status_code < 300,
                })

            except Exception as e:
                results.append({
                    "webhook_id": str(webhook["id"]),
                    "url": webhook["url"],
                    "error": str(e),
                    "success": False,
                })

        result = {"event": event, "deliveries": results}
        
        if task_db_id:
            update_task_status(task_db_id, "completed", result=result)
        
        log_integration_event(project_id, "webhook", "notifications",
                             f"webhook.{event}", "success", result)
        
        return result

    except Exception as e:
        if task_db_id:
            update_task_status(task_db_id, "failed", error=str(e))
        
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))
