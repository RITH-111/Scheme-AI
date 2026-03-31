from chroma_db import collection

# get first 5 stored chunks
results = collection.get(limit=5)

documents = results.get("documents", [])
metadatas = results.get("metadatas", [])
ids = results.get("ids", [])

print("\n📦 STORED CHUNKS:\n")

for i in range(len(documents)):
    print(f"ID: {ids[i]}")
    print(f"Metadata: {metadatas[i]}")
    print(f"Text:\n{documents[i]}")  # first 300 chars
    print("-" * 50)