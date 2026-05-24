from eligibility_engine import evaluate_scheme


def scheme_with(text):
    return {"eligibility": text}


def test_age_range_match():
    scheme = scheme_with("Applicants between 18 and 25 years")
    profile = {"age": 20}
    status, pct, explanations = evaluate_scheme(scheme, profile)
    assert status in ("Eligible", "Nearly Eligible")
    assert any("Age check" in e for e in explanations)


def test_age_plus_syntax():
    scheme = scheme_with("Applicants 18+")
    profile = {"age": 19}
    status, pct, explanations = evaluate_scheme(scheme, profile)
    assert any("Age check" in e for e in explanations)


def test_missing_age_does_not_crash():
    scheme = scheme_with("Applicants between 18 and 25 years")
    profile = {}  # no age
    status, pct, explanations = evaluate_scheme(scheme, profile)
    # Without age we should get a determination that doesn't crash; since age can't be evaluated,
    # the function should either mark Generally Eligible or evaluate other checks. We expect no exception.
    assert isinstance(status, str)


def test_income_lakh_less():
    scheme = scheme_with("Annual family income should be less than 5 lakh")
    profile = {"annual_income": 400000}
    status, pct, explanations = evaluate_scheme(scheme, profile)
    assert any("Income check" in e for e in explanations)


def test_state_mismatch():
    scheme = scheme_with("Only for residents of Kerala")
    profile = {"state": "Tamil Nadu"}
    status, pct, explanations = evaluate_scheme(scheme, profile)
    assert any("State check" in e for e in explanations)
