import re


# -------------------------
# 🔥 EXTRACT AGE FROM QUERY
# -------------------------
def extract_query_age(query):
    query = query.lower()

    # 18 to 60 / 18-60
    match = re.search(r'(\d+)\s*(to|-)\s*(\d+)', query)
    if match:
        return int(match.group(1)), int(match.group(3))

    # above 60
    match = re.search(r'(above|greater than|more than)\s*(\d+)', query)
    if match:
        return int(match.group(2)), None

    # below 18
    match = re.search(r'(below|less than|under)\s*(\d+)', query)
    if match:
        return None, int(match.group(2))

    return None, None


def _extract_strict_state(query_lower):
    match = re.search(r"\bonly\s+([a-z\s]+?)(?:\s+schemes|\s+scheme|$)", query_lower)
    if match:
        return match.group(1).strip()
    return None


def _normalize_age(value):
    try:
        age = int(value)
    except (TypeError, ValueError):
        return None
    if age < 0 or age > 120:
        return None
    return age


def filter_schemes(schemes, profile, query):
    filtered = []

    # 🔥 USER PROFILE
    occupation = profile.get("occupation", "").lower()
    state = profile.get("state", "").lower()
    gender = profile.get("gender", "").lower()
    community = profile.get("community", "").lower()

    is_student = profile.get("is_student", False)
    is_disabled = profile.get("is_disabled", False)
    is_bpl = profile.get("is_bpl", False)
    user_age = _normalize_age(profile.get("age"))

    query_lower = query.lower()

    # 🔥 DISABILITY QUERY DETECTION
    if any(k in query_lower for k in [
        "disabled", "disability", "handicap", "impaired"
    ]):
        is_disabled = True

    # 🔥 QUERY AGE EXTRACTION (FIX 2)
    q_min_age, q_max_age = extract_query_age(query)
    strict_state = _extract_strict_state(query_lower)

    for scheme in schemes:
        score = 0

        scheme_state = scheme.get("state", "").lower()
        target_groups = scheme.get("target_group", [])

        if strict_state:
            if scheme_state in ["unknown", "multi-state", "central"]:
                continue
            if strict_state not in scheme_state:
                continue
        else:
            # unknown state should not be dropped blindly
            if scheme_state == "unknown":
                score += 1

        # -------------------------
        # ✅ STATE FILTER
        # -------------------------
        if scheme_state not in ["central", "multi-state", "unknown"] and state and scheme_state != state:
            continue
        else:
            score += 3

        # -------------------------
        # ❌ DISABILITY MISMATCH
        # -------------------------
        if not is_disabled and "disabled" in target_groups:
            continue

        # -------------------------
        # ✅ DISABILITY BOOST
        # -------------------------
        if is_disabled and "disabled" in target_groups:
            score += 3

        # -------------------------
        # 🔥 AGE FILTER (USER)
        # -------------------------
        min_age = scheme.get("min_age")
        max_age = scheme.get("max_age")

        if user_age is not None:
            if min_age is not None and user_age < min_age:
                continue
            if max_age is not None and user_age > max_age:
                continue

        # -------------------------
        # 🔥 QUERY AGE FILTER (FIX 2)
        # -------------------------

        # Case 1: scheme max < query min → no overlap
        if q_min_age is not None and max_age is not None:
            if max_age < q_min_age:
                continue

        # Case 2: scheme min > query max → no overlap
        if q_max_age is not None and min_age is not None:
            if min_age > q_max_age:
                continue

        # -------------------------
        # ✅ SCORING
        # -------------------------
        if occupation and occupation in target_groups:
            score += 4

        if is_student and "student" in target_groups:
            score += 2

        if is_bpl and "bpl" in target_groups:
            score += 2

        if gender and gender in target_groups:
            score += 1

        if community and community in target_groups:
            score += 1

        # -------------------------
        # 🔥 THRESHOLD
        # -------------------------
        if score >= 3:
            scheme["filter_score"] = score
            filtered.append(scheme)

    # -------------------------
    # 🔥 FALLBACK
    # -------------------------
    if not filtered:
        return schemes[:5]

    return filtered