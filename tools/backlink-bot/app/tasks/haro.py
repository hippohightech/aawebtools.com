import json
from app.content import generate_haro_response
from app.logger import TaskLogger


class HAROTask:
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])
        config = json.loads(task.get("config_json", "{}"))

        query = config.get("query", "")
        journalist_name = config.get("journalist_name", "")
        publication = config.get("publication", "")
        deadline = config.get("deadline", "")

        if not query:
            await task_logger.error("No HARO query provided")
            raise ValueError("No HARO query provided")

        await task_logger.info(f"Generating HARO response for: {query[:100]}...")
        await task_logger.info(f"Journalist: {journalist_name} | Publication: {publication}")

        response = await generate_haro_response(query)

        await task_logger.info(f"Response generated ({len(response)} chars)")
        await task_logger.info(f"Preview: {response[:200]}...")

        return {
            "success": True,
            "task_type": "haro",
            "query": query,
            "journalist": journalist_name,
            "publication": publication,
            "response": response,
            "deadline": deadline,
        }
