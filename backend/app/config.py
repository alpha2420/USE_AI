import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/useai")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
    WHATSAPP_SERVICE_URL: str = os.getenv("WHATSAPP_SERVICE_URL", "http://localhost:3000")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "grok")

    class Config:
        env_file = ".env"

settings = Settings()
