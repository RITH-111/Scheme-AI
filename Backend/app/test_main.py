from fastapi.testclient import TestClient
import os
import sys

sys.path.append(os.path.dirname(__file__))
import main


def _stub_search_schemes(_query):
    return {
        "schemes": [
            {
                "scheme_name": "Farmer Support Scheme",
                "details": "Support for farmers in Tamil Nadu",
                "eligibility": "age 18 to 60; farmer; below 5 lakh income",
                "benefits": "Cash support; subsidies",
                "state": "tamil nadu",
                "target_group": ["farmer", "bpl"],
                "min_age": 18,
                "max_age": 60,
                "distance": 0.2,
                "filter_score": 3,
            }
        ],
        "intents": ["benefits"],
    }


def _stub_generate_response(_context):
    return "Farmer Support Scheme is a good match."


client = TestClient(main.app)


def test_health_and_ready():
    health = client.get("/health")
    assert health.status_code == 200
    assert "X-Request-Id" in health.headers
    ready = client.get("/ready")
    assert ready.status_code in (200, 503)
    assert "X-Request-Id" in ready.headers


def test_session_crud_and_chat_flow(monkeypatch):
    monkeypatch.setattr(main, "search_schemes", _stub_search_schemes)
    monkeypatch.setattr(main, "generate_response", _stub_generate_response)

    s = client.post("/sessions", json={"user_id": "u1"}, headers={"X-User-Id": "u1"})
    assert s.status_code == 200
    session_id = s.json()["session_id"]

    chat1 = client.post(
        "/chat",
        json={"message": "schemes for farmers", "session_id": session_id, "user_id": "u1"},
        headers={"X-User-Id": "u1"},
    )
    assert chat1.status_code == 200
    assert chat1.json()["recommended_schemes"]
    assert "why_recommended" in chat1.json()["recommended_schemes"][0]
    assert "eligibility_breakdown" in chat1.json()["recommended_schemes"][0]
    assert "confidence" in chat1.json()["recommended_schemes"][0]

    chat2 = client.post(
        "/chat",
        json={"message": "first scheme", "session_id": session_id, "user_id": "u1"},
        headers={"X-User-Id": "u1"},
    )
    assert chat2.status_code == 200
    assert chat2.json()["selected_scheme"] is not None

    chat3 = client.post(
        "/chat",
        json={
            "message": "am i eligible",
            "session_id": session_id,
            "user_id": "u1",
            "profile": {"age": 30, "annual_income": 100000, "state": "tamil nadu", "occupation": "farmer"},
        },
        headers={"X-User-Id": "u1"},
    )
    assert chat3.status_code == 200
    assert chat3.json()["eligibility_result"] is not None
    assert chat3.json()["eligibility_result"]["eligibility_breakdown"] is not None

    owner_get = client.get(f"/sessions/{session_id}", headers={"X-User-Id": "u1"})
    assert owner_get.status_code == 200

    non_owner_get = client.get(f"/sessions/{session_id}", headers={"X-User-Id": "u2"})
    assert non_owner_get.status_code == 403

    delete_resp = client.delete(f"/sessions/{session_id}", headers={"X-User-Id": "u1"})
    assert delete_resp.status_code == 200


def test_schemes_by_persona(monkeypatch):
    monkeypatch.setattr(main, "search_schemes", _stub_search_schemes)
    response = client.post("/schemes/by-persona", json={"persona": "farmer", "limit": 3})
    assert response.status_code == 200
    data = response.json()
    assert "schemes" in data
    assert "why_recommended" in data["schemes"][0]


def test_scheme_specific_endpoints():
    q = client.get("/schemes/farmer-support-scheme/eligibility-questions")
    assert q.status_code == 200
    payload = q.json()
    assert payload["questions"]
    assert any(item["id"] == "q-farm" for item in payload["questions"])

    g = client.get("/schemes/farmer-support-scheme/guidance")
    assert g.status_code == 200
    steps = g.json()["steps"]
    assert steps
    assert "resources" in steps[0]