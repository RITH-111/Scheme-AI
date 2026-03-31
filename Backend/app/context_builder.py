def smart_truncate(text, limit=300):
    if not text:
        return ""

    if len(text) <= limit:
        return text

    truncated = text[:limit]

    if "." in truncated:
        truncated = truncated.rsplit(".", 1)[0] + "."

    return truncated


def build_context(schemes, user_profile, query, intents, top_k=3):
    context = []

    # 🔥 STRICT HEADER (forces LLM)
    context.append("STRICT DATA:")
    context.append("You MUST ONLY use the schemes listed below.")
    context.append("DO NOT add new schemes.\n")

    # 👤 USER PROFILE
    context.append("USER PROFILE:")
    context.append(f"Age: {user_profile.get('age')}")
    context.append(f"Occupation: {user_profile.get('occupation')}")
    context.append(f"State: {user_profile.get('state')}\n")

    # 🔍 QUERY
    context.append(f"USER QUERY: {query}\n")

    # 📦 SCHEMES (STRUCTURED FORMAT)
    context.append("AVAILABLE SCHEMES:")

    for i, scheme in enumerate(schemes[:top_k], 1):
        context.append(f"\nSCHEME {i}:")
        context.append(f"Name: {scheme.get('scheme_name')}")
        context.append(f"Eligibility Status: {scheme.get('eligibility_status')}")
        context.append(f"Score: {scheme.get('eligibility_score')}")

        details = smart_truncate(scheme.get("details", ""), 200)
        if details:
            context.append(f"Details: {details}")

        benefits = smart_truncate(scheme.get("benefits", ""), 200)
        if benefits:
            context.append(f"Benefits: {benefits}")

    # 🔥 HARD INSTRUCTION
    context.append("\nFINAL INSTRUCTION:")
    context.append("ONLY use the above schemes. Do NOT create or assume anything.")

    return "\n".join(context)