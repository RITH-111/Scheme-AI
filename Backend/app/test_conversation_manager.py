from conversation_manager import ConversationManager


def test_session_lifecycle():
    manager = ConversationManager()
    session = manager.create_session(user_id="u1")
    sid = session["session_id"]

    assert manager.get_session(sid) is not None
    assert manager.get_memory(sid)["last_schemes"] == []

    manager.update_memory(sid, "profile", {"age": 25})
    assert manager.get_memory(sid)["profile"]["age"] == 25

    assert manager.delete_session(sid) is True
    assert manager.get_session(sid) is None
