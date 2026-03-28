import aiosqlite
import json
from datetime import datetime
from app.config import settings

DB = str(settings.DB_PATH)


async def init_db():
    async with aiosqlite.connect(DB) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_type TEXT NOT NULL,
                target_site TEXT NOT NULL,
                title TEXT,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority INTEGER DEFAULT 0,
                config_json TEXT DEFAULT '{}',
                result_json TEXT,
                error_message TEXT,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 2,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS task_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER REFERENCES tasks(id),
                level TEXT DEFAULT 'info',
                message TEXT NOT NULL,
                screenshot_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS content_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type TEXT NOT NULL,
                target_site TEXT,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        await db.commit()


async def create_task(task_type, target_site, title, description="", priority=0, config=None):
    async with aiosqlite.connect(DB) as db:
        cursor = await db.execute(
            "INSERT INTO tasks (task_type, target_site, title, description, priority, config_json) VALUES (?, ?, ?, ?, ?, ?)",
            (task_type, target_site, title, description, priority, json.dumps(config or {}))
        )
        await db.commit()
        return cursor.lastrowid


async def get_tasks(status=None, task_type=None):
    async with aiosqlite.connect(DB) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM tasks"
        params = []
        conditions = []
        if status:
            conditions.append("status = ?")
            params.append(status)
        if task_type:
            conditions.append("task_type = ?")
            params.append(task_type)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY priority DESC, created_at ASC"
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_task(task_id):
    async with aiosqlite.connect(DB) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_next_pending():
    async with aiosqlite.connect(DB) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM tasks WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 1"
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def update_task_status(task_id, status, result=None, error=None, retry_increment=False):
    async with aiosqlite.connect(DB) as db:
        now = datetime.utcnow().isoformat()
        if status == "running":
            await db.execute("UPDATE tasks SET status = ?, started_at = ? WHERE id = ?", (status, now, task_id))
        elif status == "completed":
            await db.execute(
                "UPDATE tasks SET status = ?, completed_at = ?, result_json = ? WHERE id = ?",
                (status, now, json.dumps(result) if result else None, task_id)
            )
        elif status == "failed":
            await db.execute(
                "UPDATE tasks SET status = ?, completed_at = ?, error_message = ? WHERE id = ?",
                (status, now, error, task_id)
            )
        elif retry_increment:
            await db.execute(
                "UPDATE tasks SET status = 'pending', retry_count = retry_count + 1 WHERE id = ?",
                (task_id,)
            )
        else:
            await db.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
        await db.commit()


async def delete_task(task_id):
    async with aiosqlite.connect(DB) as db:
        await db.execute("DELETE FROM task_logs WHERE task_id = ?", (task_id,))
        await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        await db.commit()


async def add_log(task_id, message, level="info", screenshot_path=None):
    async with aiosqlite.connect(DB) as db:
        await db.execute(
            "INSERT INTO task_logs (task_id, level, message, screenshot_path) VALUES (?, ?, ?, ?)",
            (task_id, level, message, screenshot_path)
        )
        await db.commit()


async def get_logs(task_id, limit=50):
    async with aiosqlite.connect(DB) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM task_logs WHERE task_id = ? ORDER BY created_at DESC LIMIT ?",
            (task_id, limit)
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_stats():
    async with aiosqlite.connect(DB) as db:
        stats = {}
        for status in ["pending", "running", "completed", "failed", "paused"]:
            cursor = await db.execute("SELECT COUNT(*) FROM tasks WHERE status = ?", (status,))
            row = await cursor.fetchone()
            stats[status] = row[0]
        cursor = await db.execute("SELECT COUNT(*) FROM tasks")
        row = await cursor.fetchone()
        stats["total"] = row[0]
        return stats
