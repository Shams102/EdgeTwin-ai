from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_path: str = "model.pkl"
    model_version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_prefix = "EDGEAI_"


settings = Settings()
