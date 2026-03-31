import chromadb
try:
    from .config import CHROMA_COLLECTION_NAME, CHROMA_STORAGE_PATH
except ImportError:
    from config import CHROMA_COLLECTION_NAME, CHROMA_STORAGE_PATH

client = chromadb.PersistentClient(path=CHROMA_STORAGE_PATH)

collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)