from typing import Any, Dict, List, Optional
import re
import logging
import time
from collections import defaultdict, deque
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

try:
    from .retrieval import search_schemes
    from .eligibility_engine import evaluate_scheme
    from .ranking_engine import rank_schemes
    from .metadata_filter import filter_schemes
    from .context_builder import build_context
    from .llm_service import generate_response
    from .tagger import enrich_scheme
    from .conversation_manager import ConversationManager
    from .db import get_connection
    from .chroma_db import collection
    from .config import (
        FRONTEND_ORIGINS,
        LOG_LEVEL,
        RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW_SECONDS,
    )
    from .auth_service import (
        get_user_profile,
        register_with_otp,
        send_otp,
        signin_with_otp,
        upsert_user_profile,
    )
except ImportError:
    from retrieval import search_schemes
    from eligibility_engine import evaluate_scheme
    from ranking_engine import rank_schemes
    from metadata_filter import filter_schemes
    from context_builder import build_context
    from llm_service import generate_response
    from tagger import enrich_scheme
    from conversation_manager import ConversationManager
    from db import get_connection
    from chroma_db import collection
    from config import (
        FRONTEND_ORIGINS,
        LOG_LEVEL,
        RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW_SECONDS,
    )
    from auth_service import (
        get_user_profile,
        register_with_otp,
        send_otp,
        signin_with_otp,
        upsert_user_profile,
    )


app = FastAPI(title="Scheme AI API", version="1.0.0")
conv_manager = ConversationManager()
logger = logging.getLogger("scheme_ai")
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
request_buckets: Dict[str, deque] = defaultdict(deque)
RECOMMENDATION_LIMIT = 6

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "user1"
    session_id: Optional[str] = None
    persona: Optional[str] = None
    profile: Dict[str, Any] = Field(default_factory=dict)


class PersonaRequest(BaseModel):
    persona: str
    limit: int = 6


class SendOtpRequest(BaseModel):
    name: str
    email: str
    phone: str
    purpose: str


class VerifyOtpRequest(BaseModel):
    name: str
    email: str
    phone: str
    otp: str


class UpsertProfileRequest(BaseModel):
    user_id: str
    profile: Dict[str, Any] = Field(default_factory=dict)
    persona: Optional[str] = None


class SessionCreateRequest(BaseModel):
    user_id: str = "anonymous"


class HealthResponse(BaseModel):
    status: str


class ReadinessResponse(BaseModel):
    status: str
    checks: Dict[str, str]


class SessionResponse(BaseModel):
    session_id: str
    user_id: str
    created_at: str
    updated_at: str
    memory: Dict[str, Any]


class DeleteSessionResponse(BaseModel):
    deleted: bool
    session_id: str


class SchemesResponse(BaseModel):
    schemes: List[Dict[str, Any]]


class ChatResponse(BaseModel):
    session_id: str
    assistant_message: str
    recommended_schemes: List[Dict[str, Any]] = Field(default_factory=list)
    selected_scheme: Optional[Dict[str, Any]] = None
    eligibility_result: Optional[Dict[str, Any]] = None
    scheme_overview: Optional[Dict[str, Any]] = None
    guidance: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class EligibilityQuestionsResponse(BaseModel):
    scheme_id: str
    questions: List[Dict[str, Any]]


class GuidanceResponse(BaseModel):
    scheme_id: str
    steps: List[Dict[str, Any]]
    blockers: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    authority: Optional[str] = None
    application_url: Optional[str] = None
    timeline: Optional[str] = None


class SendOtpResponse(BaseModel):
    phone: str
    message: str
    dev_otp: str


class AuthResponse(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    message: str
    persona: Optional[str] = None
    profile: Dict[str, Any] = Field(default_factory=dict)


def _client_key(request: Request) -> str:
    user = request.headers.get("X-User-Id")
    if user:
        return f"user:{user}"
    return f"ip:{request.client.host if request.client else 'unknown'}"


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-Id") or str(uuid4())
    key = _client_key(request)
    now = time.time()

    bucket = request_buckets[key]
    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content=ErrorResponse(
                code="rate_limited",
                message="Too many requests. Please retry later.",
                details={"window_seconds": RATE_LIMIT_WINDOW_SECONDS, "limit": RATE_LIMIT_REQUESTS},
            ).model_dump(),
            headers={"X-Request-Id": request_id},
        )
    bucket.append(now)

    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    response.headers["X-Request-Id"] = request_id
    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "client_key": key,
        },
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        message = detail.get("message", "Request failed")
        details = detail.get("details")
    else:
        message = str(detail)
        details = None
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            code=f"http_{exc.status_code}",
            message=message,
            details=details,
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code="internal_error",
            message="Unexpected server error",
            details=str(exc),
        ).model_dump(),
    )


def _is_discovery_query(query: str) -> bool:
    keywords = ["schemes for", "show", "list", "find", "give me", "recommend"]
    return any(k in query.lower() for k in keywords)


def _needs_user_profile(query: str) -> bool:
    keywords = [
        "eligible", "am i eligible", "for me", "my", "student", "farmer",
        "disabled", "income", "age"
    ]
    return any(k in query.lower() for k in keywords)


def _to_scheme_id(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _infer_category(scheme: Dict[str, Any]) -> str:
    text = (
        str(scheme.get("scheme_name", "")) + " " +
        str(scheme.get("details", "")) + " " +
        str(scheme.get("benefits", ""))
    ).lower()
    if any(k in text for k in ["school", "college", "education", "scholarship", "student"]):
        return "education"
    if any(k in text for k in ["health", "hospital", "medical", "insurance"]):
        return "health"
    if any(k in text for k in ["farmer", "kisan", "agri", "crop"]):
        return "agricultural"
    if any(k in text for k in ["job", "employment", "startup", "business", "loan"]):
        return "employment"
    if any(k in text for k in ["housing", "infrastructure", "road", "transport"]):
        return "infrastructure"
    return "welfare"


def _normalize_scheme(scheme: Dict[str, Any]) -> Dict[str, Any]:
    name = str(scheme.get("scheme_name", "Unknown Scheme"))
    eligibility = str(scheme.get("eligibility", ""))
    benefits_text = str(scheme.get("benefits", ""))
    benefit_items = [b.strip() for b in re.split(r"[.;\n]", benefits_text) if b.strip()]
    eligibility_items = [e.strip() for e in re.split(r"[.;\n]", eligibility) if e.strip()]

    confidence = min(1.0, max(0.0, round(float(scheme.get("final_score", 75)) / 100.0, 2)))
    why_recommended: List[str] = []
    if scheme.get("eligibility_status"):
        why_recommended.append(f"Eligibility status: {scheme.get('eligibility_status')}")
    if scheme.get("filter_score", 0) > 0:
        why_recommended.append(f"Profile relevance score: {scheme.get('filter_score')}")
    if scheme.get("distance") is not None:
        why_recommended.append("Semantic match from retrieval engine")
    if not why_recommended:
        why_recommended.append("Relevant by scheme details and category")

    eligibility_breakdown = {
        "status": scheme.get("eligibility_status", "Info"),
        "score": scheme.get("eligibility_score", None),
        "checked_criteria": [e.strip() for e in eligibility_items[:3]],
    }

    return {
        "id": _to_scheme_id(name),
        "name": name,
        "description": str(scheme.get("details", ""))[:400] or "No description available.",
        "eligibility": eligibility_items[:6],
        "benefits": benefit_items[:6],
        "category": _infer_category(scheme),
        "matchPercentage": min(100, max(0, int(round(scheme.get("final_score", 75))))),
        "why_recommended": why_recommended,
        "eligibility_breakdown": eligibility_breakdown,
        "confidence": confidence,
        "raw": scheme,
    }


def _build_default_profile(persona: Optional[str]) -> Dict[str, Any]:
    base = {
        "age": 25,
        "gender": "female",
        "state": "tamil nadu",
        "area": "rural",
        "community": "obc",
        "is_disabled": False,
        "is_student": False,
        "occupation": "unemployed",
        "annual_income": 200000,
        "family_income": 250000,
        "is_bpl": False,
        "is_government_employee": False,
    }
    persona = (persona or "").lower()
    if persona == "student":
        base["is_student"] = True
        base["occupation"] = "student"
    elif persona == "farmer":
        base["occupation"] = "farmer"
        base["is_bpl"] = True
    elif persona == "disabled":
        base["is_disabled"] = True
    elif persona == "senior-citizen":
        base["age"] = 63
    elif persona == "entrepreneur":
        base["occupation"] = "entrepreneur"
    return base


def _profile_clarifying_questions(profile: Dict[str, Any]) -> List[str]:
    questions: List[str] = []

    state = str(profile.get("state", "")).strip().lower()
    if not state or state in {"", "na", "n/a", "unknown"}:
        questions.append("Which state do you currently live in?")

    age = profile.get("age")
    if age in (None, "", 0):
        questions.append("What is your age?")

    occupation = str(profile.get("occupation", "")).strip().lower()
    if not occupation or occupation in {"", "na", "n/a", "unknown"}:
        questions.append("What is your current occupation (student, farmer, unemployed, entrepreneur, etc.)?")

    annual_income = profile.get("annual_income")
    if annual_income in (None, "", 0):
        questions.append("What is your annual family income range?")

    return questions[:3]


def _run_scheme_pipeline(query: str, persona: Optional[str], profile: Dict[str, Any]) -> Dict[str, Any]:
    result = search_schemes(query)
    schemes = result.get("schemes", [])
    intents = result.get("intents", [])
    if not schemes:
        return {"schemes": [], "intents": intents}

    enriched = [enrich_scheme(s) for s in schemes]
    use_profile = _needs_user_profile(query)
    effective_profile = _build_default_profile(persona)
    effective_profile.update(profile or {})

    if use_profile:
        enriched = filter_schemes(enriched, effective_profile, query)

    discovery_mode = _is_discovery_query(query)
    evaluated: List[Dict[str, Any]] = []
    for scheme in enriched:
        if discovery_mode or not use_profile:
            scheme["eligibility_status"] = "Info"
            scheme["eligibility_score"] = 60 + scheme.get("filter_score", 0)
        else:
            status, score, _ = evaluate_scheme(scheme, effective_profile)
            scheme["eligibility_status"] = status
            scheme["eligibility_score"] = score
        evaluated.append(scheme)

    ranked = rank_schemes(evaluated)
    return {"schemes": ranked[:6], "intents": intents, "profile": effective_profile}


def _persona_discovery_query(persona: Optional[str]) -> str:
    persona_queries = {
        "student": "schemes for students",
        "farmer": "schemes for farmers",
        "senior-citizen": "schemes for senior citizens",
        "entrepreneur": "startup and business support schemes",
        "unemployed": "employment and skill development schemes",
        "disabled": "schemes for disabled people",
    }
    p = (persona or "").strip().lower()
    return persona_queries.get(p, "government schemes for unemployed youth")


def _requested_persona_from_query(query: str) -> Optional[str]:
    q = query.lower()
    if "farmer" in q or "kisan" in q or "agri" in q:
        return "farmer"
    if "student" in q or "undergraduate" in q or "college" in q:
        return "student"
    if "senior" in q:
        return "senior-citizen"
    if "entrepreneur" in q or "startup" in q or "business" in q:
        return "entrepreneur"
    if "disabled" in q or "disability" in q or "visually impaired" in q:
        return "disabled"
    if "unemployed" in q or "job seeker" in q:
        return "unemployed"
    return None


def _is_persona_match_for_scheme(scheme: Dict[str, Any], persona: str) -> bool:
    text = (
        str(scheme.get("scheme_name", "")) + " " +
        str(scheme.get("details", "")) + " " +
        str(scheme.get("eligibility", ""))
    ).lower()

    checks = {
        "student": ["student", "scholarship", "college", "education", "university"],
        "farmer": ["farmer", "kisan", "agri", "crop", "agriculture"],
        "senior-citizen": ["senior", "old age", "elderly"],
        "entrepreneur": ["startup", "business", "enterprise", "entrepreneur"],
        "disabled": ["disabled", "disability", "special needs"],
        "unemployed": ["unemployed", "employment", "skill", "livelihood", "job"],
    }
    return any(token in text for token in checks.get(persona, []))


def _filter_schemes_for_requested_persona(
    schemes: List[Dict[str, Any]],
    persona: Optional[str],
) -> List[Dict[str, Any]]:
    if not persona:
        return schemes
    filtered = [s for s in schemes if _is_persona_match_for_scheme(s, persona)]
    return filtered


def _guidance_from_scheme(scheme: Dict[str, Any]) -> List[Dict[str, Any]]:
    category = _infer_category(scheme)
    scheme_id = _to_scheme_id(str(scheme.get("name", "scheme")))
    portal = f"https://www.india.gov.in/search?query={scheme_id}"

    category_resource = {
        "education": "Education scholarship portal",
        "health": "Public health scheme portal",
        "agricultural": "Agriculture department portal",
        "employment": "Employment and skilling portal",
        "infrastructure": "Housing and infrastructure portal",
        "welfare": "Social welfare department portal",
    }.get(category, "Government service portal")

    return [
        {
            "id": "step-1",
            "title": "Check eligibility criteria",
            "description": "Read all eligibility requirements before applying.",
            "action": "Verify age, income, category, and location details from the official portal.",
            "resources": ["Official scheme portal", "Eligibility checklist", category_resource, portal],
        },
        {
            "id": "step-2",
            "title": "Prepare documents",
            "description": "Collect identity, address, and category proofs.",
            "action": "Keep scanned copies of Aadhaar, income certificate, and bank details.",
            "resources": ["Document checklist", "Identity proof", "Income proof"],
        },
        {
            "id": "step-3",
            "title": "Submit application",
            "description": "Complete and submit your application form.",
            "action": f"Apply for {scheme.get('name')} through the official state/central website.",
            "resources": ["Application form", "Helpdesk contact", portal],
        },
    ]


def _scheme_overview_from_scheme(scheme: Dict[str, Any]) -> Dict[str, Any]:
    name = str(scheme.get("scheme_name") or scheme.get("name") or "Scheme")
    details = str(scheme.get("details", "")).strip()
    objective = details.split(".")[0].strip()
    if objective and not objective.endswith("."):
        objective = objective + "."
    if not objective:
        objective = f"{name} provides government support for eligible applicants."

    eligibility_summary = _split_points(scheme.get("eligibility", ""), limit=4)
    benefits = _split_points(scheme.get("benefits", ""), limit=4)
    category = _infer_category(scheme)
    scheme_id = _to_scheme_id(name)

    target_group_map = {
        "education": "Students and learners",
        "health": "Citizens needing healthcare support",
        "agricultural": "Farmers and rural households",
        "employment": "Job seekers and entrepreneurs",
        "infrastructure": "Households seeking infrastructure support",
        "welfare": "Social welfare beneficiaries",
    }

    return {
        "name": name,
        "objective": objective,
        "benefits": benefits,
        "eligibilitySummary": eligibility_summary,
        "targetGroup": target_group_map.get(category, "Eligible citizens"),
        "applicationMode": "Online portal or district facilitation office",
        "officialUrl": f"https://www.india.gov.in/search?query={scheme_id}",
    }


def _guidance_payload_for_scheme(
    scheme: Dict[str, Any],
    blockers: Optional[List[str]] = None,
) -> Dict[str, Any]:
    name = str(scheme.get("scheme_name") or scheme.get("name") or "Scheme")
    scheme_id = _to_scheme_id(name)
    category = _infer_category(scheme)

    authority_map = {
        "education": "Ministry/Department of Education",
        "health": "Ministry/Department of Health",
        "agricultural": "Agriculture Department",
        "employment": "Skill Development and Employment Department",
        "infrastructure": "Housing and Urban/Rural Development Department",
        "welfare": "Social Welfare Department",
    }


def _count_matched_checks(reason_items: Any) -> int:
    if not isinstance(reason_items, list):
        return 0
    count = 0
    for item in reason_items:
        text = str(item)
        if any(token in text for token in ["âœ”", "âœ“", "Ã¢Å“â€"]):
            count += 1
    return count


def _extract_blockers(reason_items: Any) -> List[str]:
    if not isinstance(reason_items, list):
        return []

    blockers: List[str] = []
    for item in reason_items:
        text = str(item).strip()
        if not text:
            continue

        if ":" in text:
            label, value = text.split(":", 1)
            value = value.strip()
            if any(token in value for token in ["âœ”", "âœ“", "Ã¢Å“â€"]):
                continue
            if any(token in value for token in ["âŒ", "âœ˜", "Ã¢ÂÅ’", "not", "fail", "no"]):
                blockers.append(label.strip())
                continue
        else:
            lower = text.lower()
            if "not eligible" in lower or "failed" in lower:
                blockers.append(text)

    return blockers


def _compact_assistant_message(raw_text: str, top_schemes: List[Dict[str, Any]]) -> str:
    text = re.sub(r"\s+", " ", str(raw_text or "")).strip()
    if not text:
        text = "I found relevant schemes for your query."

    noisy_markers = [
        "no suitable schemes found",
        "based on the user profile and query",
        "application steps:",
        "why it matches",
    ]
    too_long = len(text) > 420
    too_noisy = any(marker in text.lower() for marker in noisy_markers)

    if too_long or too_noisy:
        if not top_schemes:
            return "I found some relevant schemes. Share a bit more profile detail to improve matching."

        first = top_schemes[0]
        first_name = str(first.get("scheme_name", "Top scheme"))
        first_score = int(round(float(first.get("final_score", 75))))
        total = len(top_schemes)
        return (
            f"I found {total} matching scheme{'s' if total > 1 else ''}. "
            f"Top recommendation: {first_name} ({first_score}% match). "
            "Select a scheme to check eligibility and get personalized guidance."
        )

    return text

    base_steps = _guidance_from_scheme({"name": name, "scheme_name": name, "details": scheme.get("details", "")})
    steps: List[Dict[str, Any]] = []
    for index, step in enumerate(base_steps):
        status = "pending"
        if index == 0 and blockers:
            status = "blocked"
        steps.append(
            {
                "id": step.get("id", f"step-{index+1}"),
                "title": step.get("title", f"Step {index+1}"),
                "description": step.get("description", ""),
                "status": status,
            }
        )

    return {
        "steps": steps,
        "blockers": blockers or [],
        "required_documents": [
            "Identity proof (Aadhaar/Voter ID)",
            "Address proof",
            "Community/income certificates (if applicable)",
            "Bank account details",
            "Scheme-specific academic or occupation proof",
        ],
        "authority": authority_map.get(category, "Relevant government department"),
        "application_url": f"https://www.india.gov.in/search?query={scheme_id}",
        "timeline": "Typical verification and approval may take 2-6 weeks depending on department workflow.",
    }


def _split_points(value: Any, limit: int = 6) -> List[str]:
    if isinstance(value, list):
        items = [str(v).strip() for v in value if str(v).strip()]
        return items[:limit]
    text = str(value or "").strip()
    if not text:
        return []
    items = [p.strip() for p in re.split(r"[.;\n]", text) if p.strip()]
    return items[:limit]


def _is_selected_scheme_followup(query: str, selected_scheme: Optional[Dict[str, Any]]) -> bool:
    if not selected_scheme:
        return False
    q = query.lower().strip()
    followup_keywords = [
        "eligibility criteria",
        "eligibility",
        "criteria",
        "benefits",
        "benefit",
        "documents",
        "document",
        "papers",
        "how to apply",
        "application process",
        "apply process",
        "details",
        "explain",
    ]
    return any(k in q for k in followup_keywords)


def _selected_scheme_followup_answer(query: str, selected_scheme: Dict[str, Any]) -> str:
    q = query.lower().strip()
    name = str(selected_scheme.get("scheme_name", "selected scheme"))
    eligibility = _split_points(selected_scheme.get("eligibility", ""), limit=8)
    benefits = _split_points(selected_scheme.get("benefits", ""), limit=8)
    guidance_steps = _guidance_from_scheme({"name": name, "scheme_name": name, "details": selected_scheme.get("details", "")})

    if "eligibility" in q or "criteria" in q:
        if not eligibility:
            return (
                f"Eligibility criteria for {name} are not fully structured in my records. "
                "Please check the official notification and I can help interpret it."
            )
        return (
            f"Eligibility criteria for {name}: "
            + " ".join([f"{i+1}) {item}." for i, item in enumerate(eligibility)])
        )

    if "benefit" in q:
        if not benefits:
            return f"Benefits for {name} are not clearly listed in my current records."
        return f"Main benefits of {name}: " + " ".join([f"{i+1}) {item}." for i, item in enumerate(benefits)])

    if any(k in q for k in ["document", "papers"]):
        return (
            f"Documents typically needed for {name}: "
            "1) Identity proof (Aadhaar/Voter ID), "
            "2) Address proof, "
            "3) Category/income certificates if applicable, "
            "4) Bank account details, "
            "5) Scheme-specific academic/occupation proofs."
        )

    if any(k in q for k in ["apply", "application process", "how to apply"]):
        return (
            f"Application process for {name}: "
            + " ".join([f"{i+1}) {step.get('title', 'Step')}: {step.get('description', '')}" for i, step in enumerate(guidance_steps)])
        )

    details = str(selected_scheme.get("details", "")).strip()
    if details:
        return f"About {name}: {details[:600]}"
    return f"I can explain {name} eligibility, benefits, required documents, or application steps. Ask what you need."


def _infer_questions_from_scheme(scheme: Dict[str, Any]) -> List[Dict[str, Any]]:
    category = _infer_category(scheme)
    questions: List[Dict[str, Any]] = [
        {"id": "q-age", "question": "What is your age?", "type": "text"},
        {"id": "q-income", "question": "What is your annual family income?", "type": "text"},
        {"id": "q-citizen", "question": "Are you an Indian citizen?", "type": "yes-no"},
    ]

    category_questions = {
        "education": {"id": "q-edu", "question": "Are you currently studying in a recognized institution?", "type": "yes-no"},
        "health": {"id": "q-health", "question": "Do you have any existing health coverage?", "type": "yes-no"},
        "agricultural": {"id": "q-farm", "question": "Do you own or cultivate agricultural land?", "type": "yes-no"},
        "employment": {"id": "q-work", "question": "What is your current employment status?", "type": "multiple-choice", "options": ["Unemployed", "Self-employed", "Salaried", "Student"]},
        "infrastructure": {"id": "q-house", "question": "Do you currently own a house?", "type": "yes-no"},
        "welfare": {"id": "q-welfare", "question": "Do you belong to any priority social category?", "type": "yes-no"},
    }

    questions.append(category_questions.get(category, category_questions["welfare"]))

    if "disab" in (str(scheme.get("details", "")) + str(scheme.get("eligibility", ""))).lower():
        questions.append({"id": "q-disability", "question": "Do you have a valid disability certificate?", "type": "yes-no"})
    return questions


def _extract_user_from_auth_header(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    if token.startswith("user:"):
        token = token.split(":", 1)[1]
    return token or None


def _resolve_request_user(
    payload_user_id: Optional[str],
    x_user_id: Optional[str],
    authorization: Optional[str],
) -> str:
    token_user = _extract_user_from_auth_header(authorization)
    candidate = token_user or x_user_id or payload_user_id or "anonymous"
    return str(candidate).strip() or "anonymous"


def _ensure_session_owner(session: Dict[str, Any], request_user_id: str) -> None:
    owner = str(session.get("user_id", "anonymous"))
    if owner != request_user_id:
        raise HTTPException(status_code=403, detail="Session does not belong to this user")


def _resolve_session(session_id: Optional[str], user_id: str) -> Dict[str, Any]:
    if session_id:
        session = conv_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        _ensure_session_owner(session, user_id)
        return session
    return conv_manager.create_session(user_id=user_id)


@app.get("/health", response_model=HealthResponse, tags=["ops"], summary="Liveness health check")
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/ready", response_model=ReadinessResponse, tags=["ops"], summary="Dependency readiness check")
def ready() -> ReadinessResponse:
    checks = {"postgres": "ok", "chroma": "ok", "llm": "ok"}

    try:
        conn = get_connection()
        conn.close()
    except Exception as exc:
        checks["postgres"] = f"error: {exc}"

    try:
        _ = collection.count()
    except Exception as exc:
        checks["chroma"] = f"error: {exc}"

    try:
        _ = generate_response("AVAILABLE SCHEMES:\nNo suitable schemes found.")
    except Exception as exc:
        checks["llm"] = f"error: {exc}"

    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return ReadinessResponse(status=status, checks=checks)


@app.post("/sessions", tags=["sessions"], summary="Create new chat session")
def create_session(
    payload: SessionCreateRequest,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> SessionResponse:
    resolved_user = _resolve_request_user(payload.user_id, x_user_id, authorization)
    session = conv_manager.create_session(user_id=resolved_user)
    return SessionResponse(
        session_id=session["session_id"],
        user_id=session["user_id"],
        created_at=session["created_at"],
        updated_at=session["updated_at"],
        memory=session["memory"],
    )


@app.post("/auth/send-otp", response_model=SendOtpResponse, tags=["auth"], summary="Send OTP to mobile")
def auth_send_otp(payload: SendOtpRequest) -> SendOtpResponse:
    try:
        purpose = payload.purpose.strip().lower()
        if purpose not in {"signin", "signup"}:
            raise HTTPException(status_code=400, detail="purpose must be signin or signup")
        data = send_otp(payload.name, payload.email, payload.phone, purpose)
        return SendOtpResponse(**data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/auth/signup", response_model=AuthResponse, tags=["auth"], summary="Register user via OTP")
def auth_signup(payload: VerifyOtpRequest) -> AuthResponse:
    try:
        result = register_with_otp(payload.name, payload.email, payload.phone, payload.otp)
        return AuthResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/auth/signin", response_model=AuthResponse, tags=["auth"], summary="Sign in user via OTP")
def auth_signin(payload: VerifyOtpRequest) -> AuthResponse:
    try:
        result = signin_with_otp(payload.name, payload.email, payload.phone, payload.otp)
        return AuthResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/users/profile", response_model=AuthResponse, tags=["auth"], summary="Upsert user profile")
def users_profile_upsert(payload: UpsertProfileRequest) -> AuthResponse:
    try:
        result = upsert_user_profile(payload.user_id, payload.profile, payload.persona)
        return AuthResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/users/{user_id}/profile", response_model=AuthResponse, tags=["auth"], summary="Get user profile")
def users_profile_get(user_id: str) -> AuthResponse:
    try:
        result = get_user_profile(user_id)
        return AuthResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/sessions/{session_id}", tags=["sessions"], summary="Get session snapshot")
def get_session(
    session_id: str,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> SessionResponse:
    request_user = _resolve_request_user(None, x_user_id, authorization)
    session = conv_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    _ensure_session_owner(session, request_user)
    return SessionResponse(
        session_id=session["session_id"],
        user_id=session["user_id"],
        created_at=session["created_at"],
        updated_at=session["updated_at"],
        memory=session["memory"],
    )


@app.delete("/sessions/{session_id}", tags=["sessions"], summary="Delete a chat session")
def delete_session(
    session_id: str,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> DeleteSessionResponse:
    request_user = _resolve_request_user(None, x_user_id, authorization)
    session = conv_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    _ensure_session_owner(session, request_user)

    deleted = conv_manager.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return DeleteSessionResponse(deleted=True, session_id=session_id)


@app.post("/schemes/by-persona", response_model=SchemesResponse, tags=["schemes"], summary="Get schemes by persona")
def schemes_by_persona(payload: PersonaRequest) -> SchemesResponse:
    persona_queries = {
        "student": "schemes for students",
        "farmer": "schemes for farmers",
        "senior-citizen": "schemes for senior citizens",
        "entrepreneur": "startup and business support schemes",
        "unemployed": "employment and skill development schemes",
        "disabled": "schemes for disabled people",
    }
    query = persona_queries.get(payload.persona.lower(), f"schemes for {payload.persona}")
    data = _run_scheme_pipeline(query, payload.persona, {})
    normalized = [_normalize_scheme(s) for s in data["schemes"]][:payload.limit]
    return SchemesResponse(schemes=normalized)


@app.post("/chat", response_model=ChatResponse, tags=["chat"], summary="Chat with scheme assistant")
def chat(
    payload: ChatRequest,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> ChatResponse:
    try:
        request_user = _resolve_request_user(payload.user_id, x_user_id, authorization)
        session = _resolve_session(payload.session_id, request_user)
        session_id = session["session_id"]
        memory = conv_manager.get_memory(session_id)
        intent = conv_manager.detect_intent(payload.message)
        requested_persona = _requested_persona_from_query(payload.message)
        strict_persona_query = _is_discovery_query(payload.message) and requested_persona is not None

        profile = _build_default_profile(payload.persona)
        profile.update(memory.get("profile", {}))
        profile.update(payload.profile or {})
        conv_manager.update_memory(session_id, "profile", profile)

        if intent == "select_scheme":
            last_schemes = memory.get("last_schemes", [])
            idx = conv_manager.get_scheme_index(payload.message)
            if idx is None or idx >= len(last_schemes):
                return ChatResponse(
                    session_id=session_id,
                    assistant_message="Please select using first to sixth scheme from recent recommendations.",
                    recommended_schemes=[_normalize_scheme(s) for s in last_schemes[:RECOMMENDATION_LIMIT]],
                )

            selected = last_schemes[idx]
            conv_manager.update_memory(session_id, "selected_scheme", selected)
            selected_name = selected.get("scheme_name", "selected scheme")
            return ChatResponse(
                session_id=session_id,
                assistant_message=f"Selected scheme: {selected_name}. You can now ask: am I eligible?",
                selected_scheme=_normalize_scheme(selected),
                scheme_overview=_scheme_overview_from_scheme(selected),
                guidance=_guidance_payload_for_scheme(selected),
                recommended_schemes=[_normalize_scheme(s) for s in last_schemes[:RECOMMENDATION_LIMIT]],
            )

        if intent == "eligibility_check":
            selected = memory.get("selected_scheme")
            if not selected:
                last_schemes = memory.get("last_schemes", [])
                return ChatResponse(
                    session_id=session_id,
                    assistant_message="Please select a scheme first (say first to sixth scheme).",
                    recommended_schemes=[_normalize_scheme(s) for s in last_schemes[:RECOMMENDATION_LIMIT]],
                )
            status, score, reason = evaluate_scheme(selected, profile)
            selected_name = selected.get("scheme_name", "selected scheme")
            reason_text = "; ".join(reason) if isinstance(reason, list) else str(reason)
            return ChatResponse(
                session_id=session_id,
                assistant_message=f"Eligibility for {selected_name}: {status} ({score}%). {reason_text}",
                selected_scheme=_normalize_scheme(selected),
                scheme_overview=_scheme_overview_from_scheme(selected),
                eligibility_result={
                    "scheme_name": selected_name,
                    "status": status,
                    "score": score,
                    "reason": reason,
                    "eligibility_breakdown": {
                        "matched_criteria_count": _count_matched_checks(reason),
                        "total_checked_criteria": len(reason) if isinstance(reason, list) else None,
                        "confidence": min(1.0, max(0.0, round(float(score) / 100.0, 2))),
                    },
                },
                guidance=_guidance_payload_for_scheme(
                    selected,
                    blockers=_extract_blockers(reason),
                ),
                recommended_schemes=[_normalize_scheme(s) for s in memory.get("last_schemes", [])[:RECOMMENDATION_LIMIT]],
            )

        selected_in_memory = memory.get("selected_scheme")
        if intent == "new_query" and _is_selected_scheme_followup(payload.message, selected_in_memory):
            answer = _selected_scheme_followup_answer(payload.message, selected_in_memory)
            return ChatResponse(
                session_id=session_id,
                assistant_message=answer,
            )

        data = _run_scheme_pipeline(payload.message, payload.persona, profile)
        top = data.get("schemes", [])
        if strict_persona_query:
            top = _filter_schemes_for_requested_persona(top, requested_persona)
        top = top[:RECOMMENDATION_LIMIT]
        if top:
            conv_manager.update_memory(session_id, "last_schemes", top)
        if not top:
            fallback_persona = requested_persona or payload.persona
            fallback_data = _run_scheme_pipeline(_persona_discovery_query(fallback_persona), fallback_persona, profile)
            fallback_raw = fallback_data.get("schemes", [])[:RECOMMENDATION_LIMIT]
            fallback_top = fallback_raw
            if strict_persona_query:
                fallback_top = _filter_schemes_for_requested_persona(fallback_top, requested_persona)[:RECOMMENDATION_LIMIT]
            if fallback_top:
                conv_manager.update_memory(session_id, "last_schemes", fallback_top)
                questions = _profile_clarifying_questions(profile)
                question_text = (
                    " To personalize further, please answer: " + " ".join([f"{i+1}) {q}" for i, q in enumerate(questions)])
                    if questions
                    else ""
                )
                return ChatResponse(
                    session_id=session_id,
                    assistant_message=(
                        "I found starter scheme recommendations for you based on your current profile."
                        + question_text
                    ),
                    recommended_schemes=[_normalize_scheme(s) for s in fallback_top],
                )

            # Relax strict persona filter if there are no exact keyword matches but retrieval still found relevant options.
            if strict_persona_query and fallback_raw:
                conv_manager.update_memory(session_id, "last_schemes", fallback_raw)
                return ChatResponse(
                    session_id=session_id,
                    assistant_message=(
                        "I could not find enough exact persona-tagged matches, so I’m showing the closest available schemes. "
                        "Select one to check eligibility, and I’ll refine further based on your profile."
                    ),
                    recommended_schemes=[_normalize_scheme(s) for s in fallback_raw],
                )

            previous = [] if strict_persona_query else memory.get("last_schemes", [])[:RECOMMENDATION_LIMIT]
            questions = _profile_clarifying_questions(profile)
            question_text = (
                " Please share: " + " ".join([f"{i+1}) {q}" for i, q in enumerate(questions)])
                if questions
                else ""
            )
            if strict_persona_query:
                question_text = (
                    " Please share: 1) your state, 2) your occupation details (landholding/crop/business), 3) annual income range."
                )
            return ChatResponse(
                session_id=session_id,
                assistant_message=(
                    "I could not find matching schemes for this query right now. "
                    + (
                        "You can continue with the most recent recommendations below."
                        if previous
                        else "I can still help if you share a few details."
                    )
                    + question_text
                ),
                recommended_schemes=[_normalize_scheme(s) for s in previous],
            )

        context = build_context(top, data.get("profile", {}), payload.message, data.get("intents", []))
        try:
            raw_response = generate_response(context)
            assistant_message = _compact_assistant_message(str(raw_response), top)
        except Exception:
            names = ", ".join([s.get("scheme_name", "Unknown") for s in top])
            assistant_message = f"Top scheme matches for your request: {names}."

        return ChatResponse(
            session_id=session_id,
            assistant_message=assistant_message,
            recommended_schemes=[_normalize_scheme(s) for s in top],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {exc}") from exc


@app.get(
    "/schemes/{scheme_id}/eligibility-questions",
    response_model=EligibilityQuestionsResponse,
    tags=["schemes"],
    summary="Get scheme-specific eligibility questionnaire",
)
def eligibility_questions(scheme_id: str) -> EligibilityQuestionsResponse:
    scheme_name = scheme_id.replace("-", " ").title()
    scheme_obj = {
        "scheme_name": scheme_name,
        "details": f"{scheme_name} scheme details",
        "benefits": "",
        "eligibility": "",
    }
    questions = _infer_questions_from_scheme(scheme_obj)
    return EligibilityQuestionsResponse(scheme_id=scheme_id, questions=questions)


@app.get(
    "/schemes/{scheme_id}/guidance",
    response_model=GuidanceResponse,
    tags=["schemes"],
    summary="Get scheme-specific guidance steps",
)
def scheme_guidance(scheme_id: str) -> GuidanceResponse:
    name = scheme_id.replace("-", " ").title()
    scheme = {"id": scheme_id, "name": name, "scheme_name": name, "details": f"{name} scheme details"}
    guidance = _guidance_payload_for_scheme(scheme)
    return GuidanceResponse(
        scheme_id=scheme_id,
        steps=guidance.get("steps", []),
        blockers=guidance.get("blockers", []),
        required_documents=guidance.get("required_documents", []),
        authority=guidance.get("authority"),
        application_url=guidance.get("application_url"),
        timeline=guidance.get("timeline"),
    )

