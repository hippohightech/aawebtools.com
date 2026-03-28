import json
from app.tasks.base import BaseBrowserTask
from app.content import generate_social_bookmark
from app.logger import TaskLogger
from app.config import settings


class BookmarkingTask(BaseBrowserTask):
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])
        config = json.loads(task.get("config_json", "{}"))

        if not config.get("bookmark_title"):
            tool_name = config.get("tool_name", settings.site.get("name", "AAWebTools"))
            bookmark_url = config.get("bookmark_url", settings.site.get("url", "https://aawebtools.com"))

            await task_logger.info(f"Generating bookmark content for {task['target_site']}...")
            bookmark = await generate_social_bookmark(bookmark_url, tool_name)
            config["bookmark_title"] = bookmark["title"]
            config["bookmark_description"] = bookmark["description"]
            await task_logger.info(f"Bookmark: {bookmark['title']}")

        task["config_json"] = json.dumps(config)
        return await super().execute(task)

    def build_prompt(self, task: dict) -> str:
        config = json.loads(task.get("config_json", "{}"))
        site_url = config.get("site_url", "")
        bookmark_url = config.get("bookmark_url", settings.site.get("url", "https://aawebtools.com"))
        title = config.get("bookmark_title", "")
        description = config.get("bookmark_description", "")

        return f"""Go to {site_url}

Your task: Add a bookmark/save for this URL: {bookmark_url}

Bookmark details:
- Title: {title}
- Description: {description}
- URL: {bookmark_url}
- Tags: free tools, online tools, web tools

Steps:
1. Log in if needed
2. Find the option to add/save/bookmark a URL
3. Enter the URL: {bookmark_url}
4. Enter the title and description
5. Add tags if supported
6. Submit/Save
7. Confirm it was saved

If there is a CAPTCHA, stop and report manual intervention needed."""

    def parse_result(self, history, task: dict) -> dict:
        base = super().parse_result(history, task)
        base["target_site"] = task["target_site"]
        base["task_type"] = "bookmarking"
        return base
