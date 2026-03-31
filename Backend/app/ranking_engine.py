def normalize_distance(distance):
    return 1 / (1 + distance)


def compute_personalization_bonus(scheme):
    text = (
        scheme.get("scheme_name", "") +
        scheme.get("details", "") +
        scheme.get("eligibility", "")
    ).lower()

    bonus = 0

    # 🔥 STRONG PERSONALIZATION
    if "student" in text:
        bonus += 3

    if any(k in text for k in ["sc", "st", "obc"]):
        bonus += 3

    if any(k in text for k in ["female", "women", "girl"]):
        bonus += 3

    if any(k in text for k in ["bpl", "poverty", "low income"]):
        bonus += 4

    if any(k in text for k in ["distress", "rehabilitation", "support"]):
        bonus += 3

    if "rural" in text:
        bonus += 1

    return bonus


def compute_final_score(scheme):
    eligibility_score = scheme.get("eligibility_score", 0)
    distance = scheme.get("distance", 1)
    filter_score = scheme.get("filter_score", 0)

    similarity_score = normalize_distance(distance) * 100

    if scheme.get("eligibility_status") == "Info":
        base_score = (0.4 * eligibility_score) + (0.6 * similarity_score)
    else:
        base_score = (0.7 * eligibility_score) + (0.3 * similarity_score)

    base_score += filter_score * 2

    bonus = compute_personalization_bonus(scheme)

    final_score = base_score + bonus

    # 🔥 PENALTY (NEW)
    if scheme.get("eligibility_status") == "Info":
        if eligibility_score < 60:
            final_score -= 5
    
    return round(final_score, 2)


def rank_schemes(schemes):
    for scheme in schemes:
        scheme["final_score"] = compute_final_score(scheme)

    return sorted(
        schemes,
        key=lambda x: (
            x.get("final_score", 0),
            x.get("eligibility_score", 0),
            normalize_distance(x.get("distance", 1)),
            x.get("scheme_name", ""),
        ),
        reverse=True,
    )