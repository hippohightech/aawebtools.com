import json
from pathlib import Path
from app.config import settings
from app.logger import TaskLogger


class BaseBrowserTask:
    async def execute(self, task: dict) -> dict:
        task_logger = TaskLogger(task["id"])

        try:
            from browser_use.agent.service import Agent
            from browser_use.browser.session import BrowserSession
            from browser_use.llm.google.chat import ChatGoogle
        except ImportError as e:
            await task_logger.error(f"Missing dependency: {e}. Run: pip install browser-use")
            raise

        await task_logger.info("Launching browser...")

        browser = BrowserSession(
            headless=settings.HEADLESS,
            disable_security=True,
            window_size={"width": 1280, "height": 900},
        )

        try:
            llm = ChatGoogle(
                model="gemini-2.5-flash",
                api_key=settings.GOOGLE_API_KEY,
            )

            prompt = self.build_prompt(task)
            await task_logger.info(f"Agent prompt: {prompt[:200]}...")

            agent = Agent(
                task=prompt,
                llm=llm,
                browser=browser,
                use_vision=True,
                max_failures=3,
                max_actions_per_step=4,
            )

            await task_logger.info("Agent running...")
            history = await agent.run(max_steps=50)

            result = self.parse_result(history, task)
            await task_logger.info(f"Agent finished: {'success' if result.get('success') else 'check result'}")

            return result

        finally:
            await browser.stop()
            await task_logger.info("Browser closed")

    def build_prompt(self, task: dict) -> str:
        raise NotImplementedError

    def parse_result(self, history, task: dict) -> dict:
        return {
            "success": True,
            "final_result": history.final_result() if hasattr(history, "final_result") else None,
            "steps": len(history.history) if hasattr(history, "history") else 0,
        }
