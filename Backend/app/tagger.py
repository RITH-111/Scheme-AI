import re


# -------------------------
# 🔥 AGE RANGE EXTRACTION (FIXED)
# -------------------------
def extract_age_range(text):
    text = text.lower()

    # 18 to 60 / 18-60
    match = re.search(r'(\d+)\s*(to|-)\s*(\d+)', text)
    if match:
        return int(match.group(1)), int(match.group(3))

    # above 60
    match = re.search(r'(above|greater than|more than)\s*(\d+)', text)
    if match:
        return int(match.group(2)), None

    # below 18
    match = re.search(r'(below|less than|under)\s*(\d+)', text)
    if match:
        return None, int(match.group(2))

    return None, None


def enrich_scheme(scheme):
    text = (
        scheme.get("scheme_name", "") + " " +
        scheme.get("details", "") + " " +
        scheme.get("eligibility", "")
    ).lower()

    # -------------------------
    # 🔥 STATE DETECTION
    # -------------------------
    states = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar",
        "chhattisgarh", "goa", "gujarat", "haryana",
        "himachal pradesh", "jharkhand", "karnataka", "kerala",
        "madhya pradesh", "maharashtra", "manipur", "meghalaya",
        "mizoram", "nagaland", "odisha", "punjab",
        "rajasthan", "sikkim", "tamil nadu", "telangana",
        "tripura", "uttar pradesh", "uttarakhand", "west bengal",
        "delhi", "puducherry", "ladakh", "jammu and kashmir",
        "andaman and nicobar", "chandigarh",
        "dadra and nagar haveli", "daman and diu", "lakshadweep"
    ]

    found_states = [s for s in states if s in text]

    if any(k in text for k in [
        "central government",
        "government of india",
        "centrally sponsored",
        "all states",
        "all india"
    ]):
        scheme["state"] = "central"

    elif len(found_states) == 1:
        scheme["state"] = found_states[0]

    elif len(found_states) > 1:
        scheme["state"] = "multi-state"

    else:
        scheme["state"] = "unknown"

    # -------------------------
    # 🔥 TARGET GROUP
    # -------------------------
    target_group = []

    if "farmer" in text or "agriculture" in text:
        target_group.append("farmer")

    if "student" in text or "education" in text:
        target_group.append("student")

    if any(k in text for k in [
        "disabled", "disability", "differently abled",
        "visually impaired", "hearing impaired"
    ]):
        target_group.append("disabled")

    if any(k in text for k in ["women", "female", "girl"]):
        target_group.append("female")

    if any(k in text for k in ["sc", "scheduled caste"]):
        target_group.append("sc")

    if any(k in text for k in ["st", "scheduled tribe"]):
        target_group.append("st")

    if any(k in text for k in ["obc"]):
        target_group.append("obc")

    if any(k in text for k in ["bpl", "below poverty"]):
        target_group.append("bpl")

    scheme["target_group"] = list(set(target_group))

    # -------------------------
    # 🔥 AGE RANGE (FINAL FIX)
    # -------------------------
    min_age, max_age = extract_age_range(text)

    scheme["min_age"] = min_age
    scheme["max_age"] = max_age

    return scheme