# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database settings (for Supabase PostgreSQL)
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
    
    # Supabase specific settings
    SUPABASE_PROJECT_ID: str  # The project ID part of your Supabase URL
    SUPABASE_ANON_KEY: str    # Public anon key for Storage API
    SUPABASE_SERVICE_KEY: str # Secret service role key (for admin operations)
    
    # Keep AWS settings for S3 compatibility with existing code
    AWS_ACCESS_KEY: Optional[str] = None
    AWS_SECRET_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    S3_BUCKET: Optional[str] = None
    
    # JWT Settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    COURT_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def database_url(self) -> str:
        """
        Constructs a PostgreSQL connection URL from individual components.
        This provides a convenient way to get the full database connection string.
        """
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode=require"

    @property
    def supabase_url(self) -> str:
        """
        Returns the full Supabase URL based on the project ID.
        """
        return f"https://{self.SUPABASE_PROJECT_ID}.supabase.co"

@lru_cache()
def get_settings() -> Settings:
    """
    Creates and caches a Settings instance.
    The lru_cache decorator ensures we only create one Settings instance,
    improving performance by avoiding repeated environment variable lookups.
    """
    return Settings()