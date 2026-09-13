import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "THAI CONTEXT AI Service"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgrespassword@localhost:5432/thai_context"
    )

    # Embedding Settings
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "local")  # local, gemini, openai
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    VECTOR_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "1536"))

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "local")  # local, gemini, openai
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Retrieval & Ranking
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.65"))
    TOP_K: int = int(os.getenv("TOP_K", "10"))
    
    # Configurable Ranking Weights
    WEIGHT_SEMANTIC: float = float(os.getenv("WEIGHT_SEMANTIC", "0.60"))
    WEIGHT_KEYWORD: float = float(os.getenv("WEIGHT_KEYWORD", "0.20"))
    WEIGHT_CONTEXT: float = float(os.getenv("WEIGHT_CONTEXT", "0.15"))
    WEIGHT_SOURCE: float = float(os.getenv("WEIGHT_SOURCE", "0.05"))

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

settings = Settings()
