import os
import yaml
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    def __init__(self):
        self.BASE_DIR = BASE_DIR
        self.DATA_DIR = BASE_DIR / "data"
        self.DB_PATH = self.DATA_DIR / "backlink.db"
        self.SCREENSHOTS_DIR = self.DATA_DIR / "screenshots"
        self.LOGS_DIR = self.DATA_DIR / "logs"
        self.BROWSER_PROFILE_DIR = self.DATA_DIR / "browser_profile"

        self.GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
        self.SMTP_HOST = os.getenv("SMTP_HOST", "")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        self.SMTP_USER = os.getenv("SMTP_USER", "")
        self.SMTP_PASS = os.getenv("SMTP_PASS", "")
        self.SMTP_FROM = os.getenv("SMTP_FROM", "outreach@aawebtools.com")

        self.config = self._load_yaml()

        self.HEADLESS = self.config.get("browser", {}).get("headless", False)
        self.QUEUE_POLL_INTERVAL = self.config.get("queue", {}).get("poll_interval", 5)
        self.QUEUE_DELAY = self.config.get("queue", {}).get("delay_between_tasks", 30)
        self.MAX_RETRIES = self.config.get("queue", {}).get("max_retries", 2)
        self.STEP_TIMEOUT = self.config.get("queue", {}).get("step_timeout", 180)

        # Ensure dirs exist
        self.SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        self.BROWSER_PROFILE_DIR.mkdir(parents=True, exist_ok=True)

    def _load_yaml(self):
        config_path = self.BASE_DIR / "config.yaml"
        if config_path.exists():
            with open(config_path) as f:
                return yaml.safe_load(f)
        return {}

    @property
    def site(self):
        return self.config.get("site", {})

    @property
    def tools(self):
        return self.config.get("tools", [])

    @property
    def directories(self):
        return self.config.get("directories", [])

    @property
    def article_platforms(self):
        return self.config.get("article_platforms", [])

    @property
    def bookmarking_sites(self):
        return self.config.get("bookmarking", [])


settings = Settings()
