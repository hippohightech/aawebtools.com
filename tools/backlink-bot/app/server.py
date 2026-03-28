import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
from app.database import (
    create_task, get_tasks, get_task, update_task_status,
    delete_task, get_logs, get_stats
)
from app.queue import TaskQueueWorker, set_queue_broadcast

app = FastAPI(title="Backlink Bot", docs_url="/api/docs")
worker = TaskQueueWorker()


# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()
set_queue_broadcast(manager.broadcast)


# Models
class TaskCreate(BaseModel):
    task_type: str
    target_site: str
    title: str
    description: str = ""
    priority: int = 0
    config: dict = {}


class TaskUpdate(BaseModel):
    status: Optional[str] = None


# REST API
@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/stats")
async def stats():
    return await get_stats()


@app.get("/api/tasks")
async def list_tasks(status: str = None, task_type: str = None):
    return await get_tasks(status=status, task_type=task_type)


@app.post("/api/tasks")
async def add_task(t: TaskCreate):
    task_id = await create_task(
        task_type=t.task_type,
        target_site=t.target_site,
        title=t.title,
        description=t.description,
        priority=t.priority,
        config=t.config
    )
    await manager.broadcast({"type": "task_created", "task_id": task_id})
    return {"id": task_id, "status": "pending"}


@app.get("/api/tasks/{task_id}")
async def read_task(task_id: int):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@app.patch("/api/tasks/{task_id}")
async def patch_task(task_id: int, update: TaskUpdate):
    if update.status:
        await update_task_status(task_id, update.status)
        await manager.broadcast({"type": "task_update", "task_id": task_id, "status": update.status})
    return {"ok": True}


@app.delete("/api/tasks/{task_id}")
async def remove_task(task_id: int):
    await delete_task(task_id)
    await manager.broadcast({"type": "task_deleted", "task_id": task_id})
    return {"ok": True}


@app.get("/api/tasks/{task_id}/logs")
async def task_logs(task_id: int, limit: int = 50):
    return await get_logs(task_id, limit)


@app.post("/api/queue/pause")
async def pause_queue():
    worker.pause()
    await manager.broadcast({"type": "queue_status", "paused": True})
    return {"paused": True}


@app.post("/api/queue/resume")
async def resume_queue():
    worker.resume()
    await manager.broadcast({"type": "queue_status", "paused": False})
    return {"paused": False}


@app.get("/api/queue/status")
async def queue_status():
    return {
        "running": worker.is_running,
        "paused": worker.is_paused,
        "current_task_id": worker.current_task_id,
    }


# Batch task creation for directories
@app.post("/api/tasks/batch/directories")
async def batch_directories():
    from app.config import settings
    created = []
    for d in settings.directories:
        task_id = await create_task(
            task_type="directory",
            target_site=d["name"],
            title=f"Submit to {d['name']}",
            description=f"Submit AAWebTools to {d['name']} directory",
            config={"submit_url": d["url"], "domain": d["domain"]}
        )
        created.append({"id": task_id, "name": d["name"]})
    await manager.broadcast({"type": "batch_created", "count": len(created)})
    return {"created": len(created), "tasks": created}


# Batch task creation for articles
@app.post("/api/tasks/batch/articles")
async def batch_articles():
    from app.config import settings
    topics = [
        "Free Online Tools Every Developer Should Bookmark in 2026",
        "I Built 6 Free Web Tools and Made Them Free Forever",
        "Why Free Tools Still Win: No Signup, No Limits",
        "The Best Free Invoice Generator for Freelancers in 2026",
        "How AI Content Detection Works: A Technical Deep Dive",
    ]
    platforms = settings.article_platforms
    created = []
    for i, platform in enumerate(platforms):
        topic = topics[i % len(topics)]
        task_id = await create_task(
            task_type="article",
            target_site=platform["name"],
            title=f"Publish article on {platform['name']}",
            description=f"Topic: {topic}",
            config={
                "post_url": platform["url"],
                "topic": topic,
                "backlink_url": "https://aawebtools.com",
            }
        )
        created.append({"id": task_id, "name": platform["name"]})
    await manager.broadcast({"type": "batch_created", "count": len(created)})
    return {"created": len(created), "tasks": created}


# Batch bookmarking
@app.post("/api/tasks/batch/bookmarking")
async def batch_bookmarking():
    from app.config import settings
    created = []
    for bm in settings.bookmarking_sites:
        task_id = await create_task(
            task_type="bookmarking",
            target_site=bm["name"],
            title=f"Bookmark on {bm['name']}",
            description=f"Save AAWebTools to {bm['name']}",
            config={
                "site_url": bm["url"],
                "bookmark_url": "https://aawebtools.com",
                "tool_name": "AAWebTools",
            }
        )
        created.append({"id": task_id, "name": bm["name"]})
    await manager.broadcast({"type": "batch_created", "count": len(created)})
    return {"created": len(created), "tasks": created}


# WebSocket
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            if msg.get("action") == "pause":
                worker.pause()
                await manager.broadcast({"type": "queue_status", "paused": True})
            elif msg.get("action") == "resume":
                worker.resume()
                await manager.broadcast({"type": "queue_status", "paused": False})
    except WebSocketDisconnect:
        manager.disconnect(ws)


# Serve static files
STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
