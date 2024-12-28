from typing import Optional

from pydantic import BaseModel, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


# Settings for running backend server
class RunConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8001
    allowed_origin: Optional[str] = None


# Settings for api prefixes


class ApiPrefix(BaseModel):
    prefix: str = "/api"


# Settings for connecting to database
class DatabaseConfig(BaseModel):
    url: PostgresDsn
    database_schema: str = "fw"
    echo: bool = False
    echo_pool: bool = False
    max_overflow: int = 10
    pool_size: int = 50


# Different settings for backend server
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
    )
    run: RunConfig = RunConfig()
    api: ApiPrefix = ApiPrefix()
    db: DatabaseConfig


settings = Settings()
