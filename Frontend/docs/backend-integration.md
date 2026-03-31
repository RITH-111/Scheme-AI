# Backend Integration Contract

## Objective
This frontend is wired to the FastAPI backend in `Backend/app/main.py`.
Every UX flow maps to concrete API endpoints and request payloads.

## Service Base URL
- Env key: `NEXT_PUBLIC_API_BASE_URL`
- Default: `http://127.0.0.1:8000`

## Core Endpoints
1. `GET /health`
- Purpose: liveness.
- UI use: optional ping/status.

2. `GET /ready`
- Purpose: readiness for Postgres, Chroma, and LLM.
- UI use: chat header status badge.
- Response shape:
```json
{
  "status": "ok|degraded",
  "checks": {
    "postgres": "ok|error: ...",
    "chroma": "ok|error: ...",
    "llm": "ok|error: ..."
  }
}
```

3. `POST /sessions`
- Purpose: create conversation session.
- Request:
```json
{ "user_id": "string" }
```
- Response includes `session_id`, `memory`, timestamps.

4. `GET /sessions/{session_id}`
- Purpose: load session snapshot.

5. `DELETE /sessions/{session_id}`
- Purpose: delete one session.

6. `POST /schemes/by-persona`
- Purpose: initial recommendations based on persona.
- Request:
```json
{ "persona": "student|farmer|senior-citizen|entrepreneur|unemployed|disabled", "limit": 6 }
```

7. `POST /chat`
- Purpose: main AI conversation and scheme matching.
- Request:
```json
{
  "message": "string",
  "user_id": "string",
  "session_id": "string|null",
  "persona": "string|null",
  "profile": {
    "age": 0,
    "gender": "female|male|other",
    "state": "tamil nadu",
    "area": "urban|rural",
    "community": "general|obc|sc|st",
    "is_disabled": false,
    "is_student": false,
    "occupation": "unemployed|student|farmer|entrepreneur|...",
    "annual_income": 0,
    "family_income": 0,
    "is_bpl": false
  }
}
```
- Response:
```json
{
  "session_id": "string",
  "assistant_message": "string",
  "recommended_schemes": [],
  "selected_scheme": {},
  "eligibility_result": {}
}
```

8. `GET /schemes/{scheme_id}/eligibility-questions`
- Purpose: scheme-specific dynamic questions.

9. `GET /schemes/{scheme_id}/guidance`
- Purpose: step-by-step guidance for selected scheme.

## Frontend Data Requirements
For accurate filtering and eligibility scoring, frontend should capture:
- `age`
- `gender`
- `state`
- `area`
- `community`
- `is_disabled`
- `is_student`
- `occupation`
- `annual_income`
- `family_income`
- `is_bpl`

These are aligned with backend defaults and checks in `_build_default_profile`, `filter_schemes`, and `evaluate_scheme`.

## Notes
- Auth is frontend-only state today; backend has no signup/login endpoint.
- Session ownership is tied to `X-User-Id` or `user_id` token logic.
- If readiness is degraded, chat can still partially work depending on which check failed.
