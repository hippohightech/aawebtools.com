import json
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.content import generate_outreach_email
from app.logger import TaskLogger
from app.config import settings


class EmailTask:
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])
        config = json.loads(task.get("config_json", "{}"))

        recipient_email = config.get("recipient_email", "")
        recipient_name = config.get("recipient_name", "")
        recipient_site = config.get("recipient_site", "")
        email_type = config.get("email_type", "resource_page")
        context = config.get("context", "")

        if not recipient_email:
            await task_logger.error("No recipient email provided")
            raise ValueError("No recipient email provided")

        # Generate email content
        await task_logger.info(f"Generating {email_type} email for {recipient_name}...")
        email = await generate_outreach_email(recipient_name, recipient_site, context, email_type)
        await task_logger.info(f"Subject: {email['subject']}")

        # Send via SMTP
        if not settings.SMTP_HOST:
            await task_logger.warning("SMTP not configured. Email generated but not sent.")
            return {
                "success": True,
                "sent": False,
                "reason": "SMTP not configured",
                "subject": email["subject"],
                "body": email["body"],
                "recipient": recipient_email,
            }

        await task_logger.info(f"Sending to {recipient_email}...")

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM
        msg["To"] = recipient_email
        msg["Subject"] = email["subject"]
        msg.attach(MIMEText(email["body"], "plain"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            use_tls=True,
        )

        await task_logger.info(f"Email sent to {recipient_email}")

        return {
            "success": True,
            "sent": True,
            "subject": email["subject"],
            "recipient": recipient_email,
            "task_type": "email",
        }
