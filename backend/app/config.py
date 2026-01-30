import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        # Basic app metadata
        self.project_name = "TomatoGuard API"
        self.description = "Tomato Plant Disease Detection System"
        self.version = "1.0.0"

        # CORS / Ngrok
        self.ngrok_url = os.getenv("NGROK_URL", "")
        self.ngrok_mode = (
            os.getenv("NGROK_MODE", "false").lower() == "true" or bool(self.ngrok_url)
        )
        self.allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

        # MongoDB
        self.db_uri = os.getenv("DB_URI", "")
        self.mongo_db_uri = os.getenv("MONGO_DB_URI", "")
        self.mongo_db_name = os.getenv("MONGO_DB_NAME", "")

        # JWT
        self.jwt_secret = os.getenv("JWT_SECRET", "")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        )

    def get_cors_origins(self) -> list[str]:
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:19006",
            "http://127.0.0.1:19006",
            "http://localhost:8081",
            "http://127.0.0.1:8081",
            "exp://192.168.100.97:8081",
            "https://*.ngrok-free.dev",
            "https://dori-unmutational-johnathon.ngrok-free.dev",
        ]

        if self.ngrok_url:
            default_origins.append(self.ngrok_url)
            if self.ngrok_url.startswith("https://"):
                default_origins.append(self.ngrok_url.replace("https://", "http://"))

        if self.allowed_origins_env:
            default_origins.extend(self.allowed_origins_env.split(","))

        return list({o.strip() for o in default_origins if o.strip()})


@lru_cache
def get_settings() -> Settings:
    return Settings()