def get_user_profile():
    profile = {}

    print("\n🧠 Let's build your profile\n")

    # 🧍 BASIC INFO
    profile["age"] = int(input("Enter your age: "))
    profile["gender"] = input("Enter your gender (Male/Female/Other): ").strip().lower()

    if profile["age"] >= 18:
        profile["marital_status"] = input(
            "Marital status (Married/Never Married/Divorced/Separated/Widowed): "
        ).strip().lower()
    else:
        profile["marital_status"] = None

    # 📍 LOCATION
    valid_states = [
        "tamil nadu", "kerala", "karnataka", "andhra pradesh",
        "telangana", "maharashtra", "gujarat", "rajasthan",
        "uttar pradesh", "bihar", "west bengal", "odisha",
        "madhya pradesh", "punjab", "haryana"
    ]

    state = input("Enter your state: ").strip().lower()

    if state not in valid_states:
        print("⚠️ Invalid state, defaulting to Tamil Nadu")
        state = "tamil nadu"

    profile["state"] = state
    profile["area"] = input("Area (Urban/Rural): ").strip().lower()

    # 🏷️ SOCIAL CATEGORY
    profile["community"] = input(
        "Community (General/OBC/SC/ST/PVTG/DNT): "
    ).strip().lower()

    # ♿ DISABILITY
    is_disabled = input("Are you a person with disability? (yes/no): ").strip().lower()
    profile["is_disabled"] = is_disabled == "yes"

    if profile["is_disabled"]:
        profile["disability_percentage"] = int(
            input("Enter disability percentage: ")
        )
    else:
        profile["disability_percentage"] = 0

    # 🎓 STUDENT
    is_student = input("Are you a student? (yes/no): ").strip().lower()
    profile["is_student"] = is_student == "yes"

    if profile["is_student"]:
        profile["education_level"] = input(
            "Education level (School/UG/PG/Other): "
        ).strip().lower()

        is_bpl = input("Are you BPL? (yes/no): ").strip().lower()
        profile["is_bpl"] = is_bpl == "yes"

        if profile["is_bpl"]:
            distress = input(
                "Are you in distress (Destitute/Penury/Extreme Hardship)? (yes/no): "
            ).strip().lower()
            profile["is_in_distress"] = distress == "yes"
        else:
            profile["is_in_distress"] = False
            profile["family_income"] = int(
                input("Enter family annual income: ")
            )

        # student defaults
        profile["employment_status"] = "student"
        profile["occupation"] = "student"

    else:
        # 💼 EMPLOYMENT
        profile["employment_status"] = input(
            "Employment (Employed/Unemployed/Self-Employed): "
        ).strip().lower()

        profile["occupation"] = input("Enter your occupation: ").strip().lower()

        if profile["employment_status"] == "employed":
            gov_emp = input(
                "Are you a government employee? (yes/no): "
            ).strip().lower()

            profile["is_government_employee"] = gov_emp == "yes"

            profile["annual_income"] = int(
                input("Enter your annual income: ")
            )
            profile["family_income"] = int(
                input("Enter family annual income: ")
            )

        else:
            profile["is_government_employee"] = False

            is_bpl = input("Are you BPL? (yes/no): ").strip().lower()
            profile["is_bpl"] = is_bpl == "yes"

            profile["annual_income"] = int(
                input("Enter your annual income: ")
            )
            profile["family_income"] = int(
                input("Enter family annual income: ")
            )

            profile["is_in_distress"] = False

    # 🌾 FARMER-SPECIFIC
    if "farmer" in profile["occupation"]:
        land = input("Do you own land? (yes/no): ").strip().lower()
        profile["land_ownership"] = land == "yes"

        if profile["land_ownership"]:
            profile["land_size_acres"] = float(
                input("Enter land size (in acres): ")
            )
        else:
            profile["land_size_acres"] = 0
    else:
        profile["land_ownership"] = False
        profile["land_size_acres"] = 0

    # 👩‍👧 FAMILY INFO
    profile["family_size"] = int(input("Enter family size: "))
    profile["dependents"] = int(input("Enter number of dependents: "))

    print("\n✅ Profile created successfully!\n")

    return profile


# 🧠 TEST RUN
if __name__ == "__main__":
    user_profile = get_user_profile()
    print("\n📦 FINAL PROFILE:\n")
    for k, v in user_profile.items():
        print(f"{k}: {v}")