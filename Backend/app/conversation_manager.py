from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4


class ConversationManager:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(self, user_id: str = "anonymous") -> Dict[str, Any]:
        session_id = str(uuid4())
        now = datetime.now(timezone.utc).isoformat()
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
            "memory": {
                "profile": {},
                "last_schemes": [],
                "selected_scheme": None,
            },
        }
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def get_memory(self, session_id: str) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            return {}
        return session.get("memory", {})

    def update_memory(self, session_id: str, key: str, value: Any) -> None:
        session = self.get_session(session_id)
        if not session:
            return
        session["memory"][key] = value
        session["updated_at"] = datetime.now(timezone.utc).isoformat()

    def detect_intent(self, query: str) -> str:
        q = query.lower().strip()

        if any(k in q for k in ["eligible", "am i eligible"]):
            return "eligibility_check"

        if any(
            k in q
            for k in [
                "first", "second", "third", "fourth", "fifth", "sixth",
                "1st", "2nd", "3rd", "4th", "5th", "6th",
                "one", "two", "three", "four", "five", "six",
            ]
        ):
            return "select_scheme"

        if any(k in q for k in ["only", "in tamil nadu", "filter"]):
            return "refine"

        return "new_query"

    def get_scheme_index(self, query: str) -> Optional[int]:
        q = query.lower()

        if "first" in q or "1st" in q or "one" in q:
            return 0
        if "second" in q or "2nd" in q or "two" in q:
            return 1
        if "third" in q or "3rd" in q or "three" in q:
            return 2
        if "fourth" in q or "4th" in q or "four" in q:
            return 3
        if "fifth" in q or "5th" in q or "five" in q:
            return 4
        if "sixth" in q or "6th" in q or "six" in q:
            return 5

        return None
