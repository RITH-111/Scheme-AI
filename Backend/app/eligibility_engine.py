import re


# -------------------------
# HELPERS
# -------------------------

def contains(text, words):
    return any(word in text for word in words)


# -------------------------
# INDIVIDUAL CHECKS
# -------------------------

def check_age(text, age):
    nums = list(map(int, re.findall(r'\d+', text)))

    if len(nums) >= 2:
        return nums[0] <= age <= nums[1]

    elif len(nums) == 1:
        if "above" in text or "minimum" in text:
            return age >= nums[0]
        if "below" in text or "maximum" in text:
            return age <= nums[0]

    return None


def check_income(text, income):
    if income is None:
        return None
    match = re.search(r'(\d+)\s*(lakh|lakhs)', text)
    if match:
        value = int(match.group(1)) * 100000
        if "less" in text or "below" in text:
            return income <= value
        if "above" in text:
            return income >= value
    return None


def check_gender(text, gender):
    if "women" in text or "female" in text:
        return gender.lower() == "female"
    if "men" in text or "male" in text:
        return gender.lower() == "male"
    return None


def check_state(text, state):
    return state.lower() in text


def check_occupation(text, occupation):
    return occupation.lower() in text


def check_community(text, community):
    keywords = ["sc", "st", "obc"]

    if any(k in text for k in keywords):
        return community.lower() in text

    return None


def check_disability(text, is_disabled):
    keywords = [
        "disabled",
        "disability",
        "differently abled",
        "visually impaired",
        "hearing impaired"
    ]

    if any(k in text for k in keywords):
        return is_disabled

    return None


def check_student(text, is_student):
    if "student" in text:
        return is_student
    return None


def check_bpl(text, is_bpl):
    if "bpl" in text or "below poverty line" in text:
        return is_bpl
    return None


def check_area(text, area):
    if "rural" in text:
        return area.lower() == "rural"
    if "urban" in text:
        return area.lower() == "urban"
    return None


# -------------------------
# MAIN EVALUATION
# -------------------------

def evaluate_scheme(scheme, profile):
    text = scheme.get("eligibility", "").lower()

    checks = []
    explanations = []

    age = profile.get("age")
    if isinstance(age, (int, float)) and (age < 0 or age > 120):
        return "Not Eligible", 0, ["Invalid age input"]

    annual_income = profile.get("annual_income")
    if isinstance(annual_income, (int, float)) and annual_income < 0:
        return "Not Eligible", 0, ["Invalid income input"]

    # AGE
    result = check_age(text, age)
    if result is not None:
        checks.append(result)
        explanations.append(f"Age check: {'✔' if result else '❌'}")

    # INCOME
    result = check_income(text, annual_income)
    if result is not None:
        checks.append(result)
        explanations.append(f"Income check: {'✔' if result else '❌'}")

    # GENDER
    result = check_gender(text, profile.get("gender", ""))
    if result is not None:
        checks.append(result)
        explanations.append(f"Gender check: {'✔' if result else '❌'}")

    # STATE
    if check_state(text, profile.get("state", "")):
        checks.append(True)
        explanations.append("State match ✔")

    # OCCUPATION
    if check_occupation(text, profile.get("occupation", "")):
        checks.append(True)
        explanations.append("Occupation match ✔")

    # COMMUNITY
    result = check_community(text, profile.get("community", ""))
    if result is not None:
        checks.append(result)
        explanations.append(f"Community check: {'✔' if result else '❌'}")

    # DISABILITY
    result = check_disability(text, profile.get("is_disabled", False))
    if result is not None:
        checks.append(result)
        explanations.append(f"Disability check: {'✔' if result else '❌'}")

    # STUDENT
    result = check_student(text, profile.get("is_student", False))
    if result is not None:
        checks.append(result)
        explanations.append(f"Student check: {'✔' if result else '❌'}")

    # BPL
    result = check_bpl(text, profile.get("is_bpl", False))
    if result is not None:
        checks.append(result)
        explanations.append(f"BPL check: {'✔' if result else '❌'}")

    # AREA
    result = check_area(text, profile.get("area", ""))
    if result is not None:
        checks.append(result)
        explanations.append(f"Area check: {'✔' if result else '❌'}")

    # -------------------------
    # SCORING
    # -------------------------

    if not checks:
        return "Generally Eligible", 60, ["No strict conditions"]

    score = sum(1 for c in checks if c)
    total = len(checks)

    percentage = (score / total) * 100

    if percentage >= 80:
        status = "Eligible"
    elif percentage >= 50:
        status = "Nearly Eligible"
    else:
        status = "Not Eligible"

    return status, round(percentage, 2), explanations