import json
from app.tasks.base import BaseBrowserTask
from app.content import generate_directory_description
from app.logger import TaskLogger
from app.config import settings


class DirectoryTask(BaseBrowserTask):
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])
        config = json.loads(task.get("config_json", "{}"))

        # Generate description if not provided
        if not config.get("description"):
            await task_logger.info(f"Generating description for {task['target_site']}...")
            config["description"] = await generate_directory_description(task["target_site"])
            await task_logger.info(f"Description generated: {config['description'][:100]}...")

        # Store generated content back
        task["config_json"] = json.dumps(config)

        return await super().execute(task)

    def build_prompt(self, task: dict) -> str:
        config = json.loads(task.get("config_json", "{}"))
        site = settings.site
        url = config.get("submit_url", "")
        description = config.get("description", site.get("description", ""))

        return f"""Go to {url}

Your task: Submit a product/tool listing for AAWebTools.

Product details to fill in:
- Name: {site.get('name', 'AAWebTools')}
- URL/Website: {site.get('url', 'https://aawebtools.com')}
- Tagline: {site.get('tagline', 'Free online web tools — no login required')}
- Description: {description}
- Category/Tags: Free Tools, Online Tools, Web Tools, Productivity, Developer Tools
- Pricing: Free

If the site requires login, look for a sign up or login button first.
If there is a CAPTCHA, stop and report that manual intervention is needed.
If the form has required fields not listed above, use reasonable defaults.

After submitting, confirm the listing was created and return the URL of the listing page.
If submission requires approval, note that in your response.

IMPORTANT: Do not make up information. If a field asks for something you don't know, skip it or leave it blank if optional."""

    def parse_result(self, history, task: dict) -> dict:
        base = super().parse_result(history, task)
        base["target_site"] = task["target_site"]
        base["task_type"] = "directory"
        return base
