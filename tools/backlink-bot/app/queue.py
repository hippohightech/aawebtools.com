import asyncio
import json
from datetime import datetime
from app.config import settings
from app.database import get_next_pending, update_task_status
from app.logger import TaskLogger, set_broadcast

_broadcast_fn = None


def set_queue_broadcast(fn):
    global _broadcast_fn
    _broadcast_fn = fn
    set_broadcast(fn)


class TaskQueueWorker:
    def __init__(self):
        self.is_running = False
        self.is_paused = False
        self.current_task_id = None

    async def broadcast(self, data):
        if _broadcast_fn:
            await _broadcast_fn(data)

    async def run_forever(self):
        self.is_running = True
        while self.is_running:
            if self.is_paused:
                await asyncio.sleep(2)
                continue

            task = await get_next_pending()
            if task is None:
                await asyncio.sleep(settings.QUEUE_POLL_INTERVAL)
                continue

            await self.execute_task(task)

            # Delay between tasks to avoid detection
            await asyncio.sleep(settings.QUEUE_DELAY)

    async def execute_task(self, task):
        self.current_task_id = task["id"]
        logger = TaskLogger(task["id"])

        await update_task_status(task["id"], "running")
        await self.broadcast({"type": "task_update", "task_id": task["id"], "status": "running"})
        await logger.info(f"Starting task: {task['title']}")

        try:
            handler = self._get_handler(task["task_type"])
            result = await handler.execute(task)
            await update_task_status(task["id"], "completed", result=result)
            await self.broadcast({"type": "task_update", "task_id": task["id"], "status": "completed"})
            await logger.info(f"Task completed successfully")

        except Exception as e:
            error_msg = str(e)
            await logger.error(f"Task failed: {error_msg}")

            if task["retry_count"] < task.get("max_retries", settings.MAX_RETRIES):
                await update_task_status(task["id"], "pending", retry_increment=True)
                await self.broadcast({"type": "task_update", "task_id": task["id"], "status": "pending"})
                await logger.warning(f"Will retry (attempt {task['retry_count'] + 1})")
            else:
                await update_task_status(task["id"], "failed", error=error_msg)
                await self.broadcast({"type": "task_update", "task_id": task["id"], "status": "failed"})

        self.current_task_id = None

    def _get_handler(self, task_type):
        from app.tasks.directory import DirectoryTask
        from app.tasks.article import ArticleTask
        from app.tasks.bookmarking import BookmarkingTask
        from app.tasks.email_outreach import EmailTask
        from app.tasks.haro import HAROTask

        handlers = {
            "directory": DirectoryTask(),
            "article": ArticleTask(),
            "bookmarking": BookmarkingTask(),
            "email": EmailTask(),
            "haro": HAROTask(),
        }
        handler = handlers.get(task_type)
        if not handler:
            raise ValueError(f"Unknown task type: {task_type}")
        return handler

    def pause(self):
        self.is_paused = True

    def resume(self):
        self.is_paused = False

    def stop(self):
        self.is_running = False
