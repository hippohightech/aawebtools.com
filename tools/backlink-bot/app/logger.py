import logging
from datetime import datetime
from app.database import add_log

logger = logging.getLogger("backlink-bot")
logger.setLevel(logging.INFO)

# Will be set by server.py when WebSocket manager is ready
_broadcast_fn = None


def set_broadcast(fn):
    global _broadcast_fn
    _broadcast_fn = fn


class TaskLogger:
    def __init__(self, task_id):
        self.task_id = task_id

    async def log(self, message, level="info"):
        await add_log(self.task_id, message, level)
        logger.log(getattr(logging, level.upper(), logging.INFO), f"[Task {self.task_id}] {message}")
        if _broadcast_fn:
            await _broadcast_fn({
                "type": "log_entry",
                "task_id": self.task_id,
                "level": level,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            })

    async def log_with_screenshot(self, message, screenshot_path, level="info"):
        await add_log(self.task_id, message, level, screenshot_path)
        logger.info(f"[Task {self.task_id}] {message} [screenshot: {screenshot_path}]")
        if _broadcast_fn:
            await _broadcast_fn({
                "type": "log_entry",
                "task_id": self.task_id,
                "level": level,
                "message": message,
                "screenshot": screenshot_path,
                "timestamp": datetime.utcnow().isoformat()
            })

    async def info(self, message):
        await self.log(message, "info")

    async def warning(self, message):
        await self.log(message, "warning")

    async def error(self, message):
        await self.log(message, "error")
