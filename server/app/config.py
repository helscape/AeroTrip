from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / server/.env."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    database_url: str = (
        "mysql+pymysql://aerotrip:aerotrip@localhost:3306/aerotrip?charset=utf8mb4"
    )
    test_database_url: str = (
        "mysql+pymysql://aerotrip:aerotrip@localhost:3306/aerotrip_test?charset=utf8mb4"
    )
    admin_api_key: str = "dev-admin-key-change-me"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    port: int = 3001
    # Safe development defaults only — set real values in .env for deployment.
    jwt_secret: str = "dev-only-jwt-secret-change-me-in-production-3f8a1c9d"
    jwt_ttl_hours: int = 168

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
