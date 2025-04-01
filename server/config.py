# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str = "5432"
    DB_NAME: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # Server settings
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: str = "8000"
    
    # AWS Settings - Adding these to match your environment
    AWS_ACCESS_KEY: str
    AWS_SECRET_KEY: str
    AWS_REGION: str
    S3_BUCKET: str
    
    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def database_url(self) -> str:
        """
        Constructs a PostgreSQL connection URL from individual components.
        This provides a convenient way to get the full database connection string.
        """
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def aws_credentials(self) -> dict:
        """
        Provides a convenient way to access AWS credentials in a structured format.
        This is helpful when initializing AWS clients.
        """
        return {
            "aws_access_key_id": self.AWS_ACCESS_KEY,
            "aws_secret_access_key": self.AWS_SECRET_KEY,
            "region_name": self.AWS_REGION
        }

@lru_cache()
def get_settings() -> Settings:
    """
    Creates and caches a Settings instance.
    The lru_cache decorator ensures we only create one Settings instance,
    improving performance by avoiding repeated environment variable lookups.
    """
    return Settings()