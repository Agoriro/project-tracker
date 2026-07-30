"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the Aztec PM backend."""

    # Database
    database_url: str = "postgresql+asyncpg://aztec_user:aztec_pass_dev@db:5432/aztec_pm"
    database_url_sync: str = "postgresql://aztec_user:aztec_pass_dev@db:5432/aztec_pm"

    # Auth / JWT
    secret_key: str = "dev-only-secret-key-change-in-production-abc123xyz"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # CORS
    backend_cors_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
