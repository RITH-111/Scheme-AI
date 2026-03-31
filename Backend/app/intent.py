from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("BAAI/bge-small-en")

INTENTS = {
    "eligibility": "who can apply eligibility criteria requirements conditions",
    "documents_required": "documents papers proof needed required to apply",
    "application_process": "how to apply steps process procedure method",
    "benefits": "benefits advantages subsidy money support gain",
    "general_info": "tell me about explain full details information overview"
}

intent_embeddings = {
    key: model.encode("query: " + text)
    for key, text in INTENTS.items()
}


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def detect_intents(query, top_k=2):
    query_embedding = model.encode("query: " + query)

    scores = []

    for intent, emb in intent_embeddings.items():
        score = cosine_similarity(query_embedding, emb)
        scores.append((intent, score))

    # sort by score
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    # return top intents
    return [intent for intent, score in scores[:top_k]]