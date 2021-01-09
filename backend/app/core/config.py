from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    BASE_DIR: Path = Path("__file__").parent.absolute()
    AUTH_SECRET_KEY: str

    PROJECT_NAME: str = "GoBaber"
    DEBUG: bool = True
    APP_WEB_URL: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: List = ["*"]
    MEDIA_ROOT: str = "tmp"
    API_SERVER_URL: str = "http://localhost:8000"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "admin123"
    POSTGRES_PORT: str = "5432"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_DB: str = "gobaber"
    DATABASE_URL: str = None

    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            port=values.get("POSTGRES_PORT"),
            host=values.get("POSTGRES_HOST"),
            path=f"/{values.get('POSTGRES_DB')}",
        )

    MONGO_DB_URI: str = None
    MONGO_HOST: str = "mongo"
    MONGO_PORT: int = 27017
    MONGO_DB: str = "gobaber"

    REDIS_URL: str = None
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = None
    REDIS_USER: str = None

    SMTP_TLS: bool = True
    SMTP_PORT: int
    SMTP_HOST: str
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM_NAME: str
    EMAIL_FROM_ADDRESS: str

    EMAIL_ENABLED: bool = False

    @validator("EMAIL_ENABLED", pre=True)
    def get_emails_enabled(cls, v: bool, values: Dict[str, Any]) -> bool:
        return bool(
            values.get("SMTP_HOST")
            and values.get("SMTP_PORT")
            and values.get("EMAIL_FROM_NAME")
            and values.get("EMAIL_FROM_ADDRESS")
        )

    # If you want to use the https://cloudinary.com/ cdn
    # Just configure these variables
    CLOUDINARY_CLOUD_NAME: str = None
    CLOUDINARY_API_KEY: str = None
    CLOUDINARY_API_SECRET: str = None
    CLOUDINARY_FOLDER_PATH: str = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()