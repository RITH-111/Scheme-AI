import psycopg2
try:
    from .config import (
        POSTGRES_DB,
        POSTGRES_HOST,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
        POSTGRES_USER,
    )
except ImportError:
    from config import (
        POSTGRES_DB,
        POSTGRES_HOST,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
        POSTGRES_USER,
    )

def get_connection():
    if not POSTGRES_PASSWORD:
        raise RuntimeError(
            "POSTGRES_PASSWORD is not set. Create Backend/.env or export the environment variable."
        )
    return psycopg2.connect(
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        host=POSTGRES_HOST,
        port=POSTGRES_PORT
    )
