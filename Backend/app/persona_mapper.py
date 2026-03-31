# persona_mapper.py

def derive_persona(profile):
    """
    Convert user profile → persona
    """

    # 🔹 Priority 1: Student
    if profile.get("is_student"):
        return "Student"

    # 🔹 Priority 2: Occupation-based personas
    occupation = profile.get("occupation", "").lower()

    if occupation in [
        "farmer",
        "dairy farmer"
    ]:
        return "Farmer"

    if occupation in [
        "fishermen"
    ]:
        return "Fishermen"

    if occupation in [
        "artisan", "spinners and weavers"
    ]:
        return "Artisan"

    if occupation in [
        "construction worker"
    ]:
        return "Construction Worker"

    if occupation in [
        "journalist"
    ]:
        return "Journalist"

    if occupation in [
        "anganwadi workers and helpers"
    ]:
        return "Anganwadi Worker"

    # 🔹 Priority 3: Special categories
    if profile.get("is_disabled"):
        return "Disabled"

    if profile.get("is_bpl"):
        return "BPL Family"

    if profile.get("is_economic_distress"):
        return "Economic Distress"

    # 🔹 Priority 4: Gender-based
    if profile.get("gender", "").lower() == "female":
        return "Women"

    # 🔹 Priority 5: Default
    return "General"