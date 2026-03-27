from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    SECRET_KEY: str = "pms-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./pms.db"
    APP_NAME: str = "PMS Platform"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    RED_FLAG_SCORE_THRESHOLD: int = 2  # score <= 2 triggers flag
    GOAL_APPROVAL_SLA_DAYS: int = 5
    FLAG_REVIEW_SLA_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
