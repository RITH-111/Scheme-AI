from sentence_transformers import SentenceTransformer
try:
    from .chroma_db import collection
    from .db import get_connection
    from .intent import detect_intents
    from .config import EMBEDDING_MODEL
except ImportError:
    from chroma_db import collection
    from db import get_connection
    from intent import detect_intents
    from config import EMBEDDING_MODEL


# Load embedding model
model = SentenceTransformer(EMBEDDING_MODEL)


def _fallback_search(query):
    try:
        conn = get_connection()
        cur = conn.cursor()
        like_query = f"%{query}%"
        cur.execute(
            "SELECT data FROM schemes WHERE scheme_name ILIKE %s OR data::text ILIKE %s LIMIT 15",
            (like_query, like_query),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [row[0] for row in rows]
    except Exception:
        return []


def _metadata_fallback(metadatas):
    schemes = []
    seen = set()
    for m in metadatas:
        scheme_name = m.get("scheme_name") or m.get("name") or "Unknown Scheme"
        if scheme_name in seen:
            continue
        seen.add(scheme_name)
        scheme = dict(m)
        scheme["scheme_name"] = scheme_name
        schemes.append(scheme)
    return schemes


def search_schemes(query):
    # Step 1: detect intents
    intents = detect_intents(query)

    # Step 2: convert query -> embedding
    query_embedding = model.encode("query: " + query)

    # Step 3: search in Chroma
    try:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=15,
        )
    except Exception:
        fallback = _fallback_search(query)
        return {"schemes": fallback, "intents": intents}

    # Step 4: safety check
    if not results.get("metadatas") or not results["metadatas"][0]:
        fallback = _fallback_search(query)
        return {"schemes": fallback, "intents": intents}

    metadatas = results["metadatas"][0]
    distances = results.get("distances", [[None]])[0]

    # Step 5: map scheme -> best (lowest) distance
    scheme_data_map = {}

    for i, m in enumerate(metadatas):
        name = m.get("scheme_name") or m.get("name") or "Unknown Scheme"
        distance = distances[i] if i < len(distances) else None

        # keep the best (lowest) distance for each scheme
        if name not in scheme_data_map or (distance is not None and distance < scheme_data_map[name]):
            scheme_data_map[name] = distance if distance is not None else scheme_data_map.get(name, 1.0)

    # Step 6: preserve order (important)
    seen = set()
    ordered_scheme_names = []

    for m in metadatas:
        name = m.get("scheme_name") or m.get("name") or "Unknown Scheme"
        if name not in seen:
            seen.add(name)
            ordered_scheme_names.append(name)

    # Step 7: fetch full data from PostgreSQL (batch)
    rows = []
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT data FROM schemes WHERE scheme_name = ANY(%s)", (ordered_scheme_names,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except Exception:
        rows = []

    # Step 8: attach distance to schemes
    full_schemes = []

    for row in rows:
        scheme = row[0]
        name = scheme.get("scheme_name") or scheme.get("name") or "Unknown Scheme"

        scheme["distance"] = scheme_data_map.get(name, 1.0)

        full_schemes.append(scheme)

    if not full_schemes:
        full_schemes = _fallback_search(query)
    if not full_schemes:
        full_schemes = _metadata_fallback(metadatas)

    return {"schemes": full_schemes, "intents": intents}
