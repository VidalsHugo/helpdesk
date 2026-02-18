"""
Asynchronous notification tasks.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger("helpdesk")


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def send_ticket_email_task(self, subject: str, message: str, recipient_list: list[str]):
    """
    Send ticket related emails via SMTP.
    """
    if not recipient_list:
        return "skipped-no-recipients"

    if not settings.EMAIL_HOST_PASSWORD:
        logger.warning("EMAIL_HOST_PASSWORD is empty. Email not sent.")
        return "skipped-missing-password"

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=False,
    )
    logger.info(f"Notification email sent to {recipient_list}")
    return "sent"
