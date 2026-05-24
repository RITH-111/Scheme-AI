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
    # If profile doesn't have an age, we cannot evaluate age-based requirements
    if age is None:
        return None

    # capture integers and decimals (e.g. 18, 18.5)
    nums = list(map(float, re.findall(r"\d+(?:\.\d+)?", text)))

    # handle patterns like "18+" or "18 and above"
    plus_match = re.search(r"(\d+(?:\.\d+)?)\s*\+", text)
    if plus_match:
        minimum = float(plus_match.group(1))
        return age >= minimum

    if len(nums) >= 2:
        return nums[0] <= age <= nums[1]

    elif len(nums) == 1:
        num = nums[0]
        if "above" in text or "minimum" in text or "and above" in text:
            return age >= num
        if "below" in text or "maximum" in text:
            return age <= num

    return None


def check_income(text, income):
    if income is None:
        return None

    # look for lakh/crore expressions with optional decimals
    m = re.search(r"(\d+(?:[\.,]\d+)?)\s*(lakh|lakhs|lac|lacs|l)\b", text)
    if m:
        number = float(m.group(1).replace(',', '').replace(' ', '').replace('\u00A0', ''))
        multiplier = 100_000
        value = int(number * multiplier)
        if "less" in text or "below" in text or "under" in text:
            return income <= value
        if "above" in text or "more" in text or "over" in text:
            return income >= value

    # look for crore
    m = re.search(r"(\d+(?:[\.,]\d+)?)\s*(crore|cr)\b", text)
    if m:
        number = float(m.group(1).replace(',', ''))
        value = int(number * 10_000_000)
        if "less" in text or "below" in text or "under" in text:
            return income <= value
        if "above" in text or "more" in text or "over" in text:
            return income >= value

    # try explicit rupee amounts like "₹50,000" or "50000"
    m = re.search(r"(?:₹|rs\.?\s*)?([\d,]+(?:\.\d+)?)", text)
    if m:
        try:
            number = float(m.group(1).replace(',', ''))
            value = int(number)
            if "less" in text or "below" in text or "under" in text:
                return income <= value
            if "above" in text or "more" in text or "over" in text:
                return income >= value
        except ValueError:
            pass

    return None


def check_gender(text, gender):
    if "women" in text or "female" in text:
        return gender.lower() == "female"
    if "men" in text or "male" in text:
        return gender.lower() == "male"
    return None


def check_state(text, state):
    if not state:
        return None
    state = state.lower()

    # If the profile state appears in the eligibility text -> pass
    if re.search(r"\b" + re.escape(state) + r"\b", text):
        return True

    # basic list of Indian states to detect if the scheme mentions a specific state
    known_states = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
        "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
        "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya",
        "mizoram", "nagaland", "odisha", "punjab", "rajasthan", "sikkim",
        "tamil nadu", "telangana", "tripura", "uttar pradesh", "uttarakhand",
        "west bengal", "delhi"
    ]

    for s in known_states:
        if re.search(r"\b" + re.escape(s) + r"\b", text):
            # scheme mentions a state but it's not the profile state -> fail
            return False

    # no state mentioned in the scheme
    return None


def check_occupation(text, occupation):
    if not occupation:
        return None
    occ = occupation.lower()
    if re.search(r"\b" + re.escape(occ) + r"\b", text):
        return True

    # quick occupation keyword list to detect whether the scheme restricts by occupation
    occ_keywords = [
        "farmer", "teacher", "driver", "agricult", "doctor", "nurse",
        "student", "self-employed", "unemployed", "worker", "employee"
    ]
    for k in occ_keywords:
        if re.search(r"\b" + k + r"\w*\b", text):
            return False

    return None


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
    result = check_state(text, profile.get("state", ""))
    if result is not None:
        checks.append(result)
        explanations.append(f"State check: {'✔' if result else '❌'}")

    # OCCUPATION
    result = check_occupation(text, profile.get("occupation", ""))
    if result is not None:
        checks.append(result)
        explanations.append(f"Occupation check: {'✔' if result else '❌'}")

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