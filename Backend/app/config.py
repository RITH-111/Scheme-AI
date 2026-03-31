import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional in environments without dotenv
    load_dotenv = None


def _to_int(value: str, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR.parent / ".env"
if load_dotenv and ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)

DATA_PATH = os.getenv("DATA_PATH", "../data/myschemes_scraped.json")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "schemes")
CHROMA_STORAGE_PATH = os.getenv("CHROMA_STORAGE_PATH", "../chroma_storage")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en")
TOP_K = _to_int(os.getenv("TOP_K", "5"), 5)

POSTGRES_DB = os.getenv("POSTGRES_DB", "scheme_ai")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
RATE_LIMIT_REQUESTS = _to_int(os.getenv("RATE_LIMIT_REQUESTS", "60"), 60)
RATE_LIMIT_WINDOW_SECONDS = _to_int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"), 60)
