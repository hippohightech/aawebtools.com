import json
from app.tasks.base import BaseBrowserTask
from app.content import generate_article
from app.logger import TaskLogger
from app.config import settings


class ArticleTask(BaseBrowserTask):
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])
        config = json.loads(task.get("config_json", "{}"))

        # Generate article if not provided
        if not config.get("article_body"):
            topic = config.get("topic", "Free Online Tools Every Developer Should Know in 2026")
            backlink_url = config.get("backlink_url", settings.site.get("url", "https://aawebtools.com"))
            keywords = config.get("keywords", [t["name"] for t in settings.tools])

            await task_logger.info(f"Generating article for {task['target_site']}...")
            article = await generate_article(topic, task["target_site"], backlink_url, keywords)
            config["article_title"] = article["title"]
            config["article_body"] = article["body"]
            await task_logger.info(f"Article generated: {article['title']}")

        task["config_json"] = json.dumps(config)
        return await super().execute(task)

    def build_prompt(self, task: dict) -> str:
        config = json.loads(task.get("config_json", "{}"))
        platform = task["target_site"]
        title = config.get("article_title", "")
        body = config.get("article_body", "")
        post_url = config.get("post_url", "")

        return f"""Go to {post_url}

Your task: Publish an article on {platform}.

If not logged in, look for login/signup options first.

Article to publish:
TITLE: {title}

BODY:
{body}

Steps:
1. Navigate to the new post/article editor
2. Enter the title in the title field
3. Paste the body content in the editor
4. If there are tags/topics, add: free tools, web development, productivity
5. Publish the article (click Publish/Submit)
6. Return the URL of the published article

If there is a CAPTCHA, stop and report manual intervention needed.
Do NOT modify the article content. Paste it exactly as provided."""

    def parse_result(self, history, task: dict) -> dict:
        base = super().parse_result(history, task)
        base["target_site"] = task["target_site"]
        base["task_type"] = "article"
        return base
