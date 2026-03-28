import asyncio
import uvicorn
from app.database import init_db
from app.server import app, worker


async def main():
    await init_db()
    asyncio.create_task(worker.run_forever())
    config = uvicorn.Config(app, host="127.0.0.1", port=8501, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    print("\n  Backlink Bot - AAWebTools")
    print("  Dashboard: http://localhost:8501")
    print("  API Docs:  http://localhost:8501/api/docs\n")
    asyncio.run(main())
