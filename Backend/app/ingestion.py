import json
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

from chunking import create_chunks
from chroma_db import collection
from config import DATA_PATH, EMBEDDING_MODEL


model = SentenceTransformer(EMBEDDING_MODEL)


def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def ingest():
    data = load_data()

    all_texts = []
    all_embeddings = []
    all_ids = []
    all_metadata = []

    idx = 0

    print("🚀 Starting ingestion...")

    for scheme in tqdm(data):
        chunks = create_chunks(scheme)

        for chunk in chunks:
            text_for_embedding = "passage: " + chunk["text"]

            embedding = model.encode(text_for_embedding)

            all_texts.append(chunk["text"])
            all_embeddings.append(embedding.tolist())
            all_ids.append(str(idx))
            all_metadata.append(chunk["metadata"])

            idx += 1

    print("📦 Storing in Chroma (batch mode)...")

    BATCH_SIZE = 500

    for i in range(0, len(all_texts), BATCH_SIZE):
        collection.add(
            documents=all_texts[i:i+BATCH_SIZE],
            embeddings=all_embeddings[i:i+BATCH_SIZE],
            ids=all_ids[i:i+BATCH_SIZE],
            metadatas=all_metadata[i:i+BATCH_SIZE]
        )

        print(f"Inserted batch {i} to {i+BATCH_SIZE}")

    print("✅ Ingestion completed successfully!")
    print(f"Total chunks stored: {len(all_texts)}")

    
    print("💾 Data persisted to disk!") 
if __name__ == "__main__":
    ingest()