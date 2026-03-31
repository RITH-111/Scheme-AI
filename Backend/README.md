# Scheme AI Backend

## Run locally

1. Create environment file:
   - Copy `.env.example` to `.env`
   - Fill `POSTGRES_PASSWORD` and any non-default values
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Start API:
   - `uvicorn app.main:app --reload --port 8000`

## Docker run

Build image:

`docker build -t scheme-ai-backend .`

Run container:

`docker run --rm -p 8000:8000 --env-file .env scheme-ai-backend`

## Core endpoints

- `POST /chat`
- `POST /schemes/by-persona`
- `GET /schemes/{scheme_id}/eligibility-questions`
- `GET /schemes/{scheme_id}/guidance`
- `POST /sessions`
- `GET /sessions/{session_id}`
- `DELETE /sessions/{session_id}`
- `GET /health`
- `GET /ready`

## Ops and safety

- Request correlation header: `X-Request-Id` on every response
- Basic rate limiting by user/IP (configurable)
- Session ownership checks via `X-User-Id` or `Authorization` bearer
