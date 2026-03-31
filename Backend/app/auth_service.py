import json
import random
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

try:
    from .db import get_connection
except ImportError:
    from db import get_connection


OTP_TTL_MINUTES = 5
DEV_BYPASS_OTP = "000000"

_otp_store: Dict[str, Dict[str, str]] = {}


def _normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) < 10:
        raise ValueError("Phone number must contain at least 10 digits.")
    return digits[-10:]


def ensure_users_table() -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            persona TEXT,
            profile JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_signin_at TIMESTAMPTZ
        )
        """
    )
    # Backward-compatible migrations for existing tables created before persona/profile fields.
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS persona TEXT")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile JSONB NOT NULL DEFAULT '{}'::jsonb")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_signin_at TIMESTAMPTZ")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT ''")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'User'")
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx ON users(phone)")
    conn.commit()
    cur.close()
    conn.close()


def send_otp(name: str, email: str, phone: str, purpose: str) -> Dict[str, str]:
    normalized_phone = _normalize_phone(phone)
    otp = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    _otp_store[normalized_phone] = {
        "otp": otp,
        "name": name.strip(),
        "email": email.strip().lower(),
        "purpose": purpose,
        "expires_at": expires_at.isoformat(),
    }
    return {
        "phone": normalized_phone,
        "message": f"OTP sent to {normalized_phone}.",
        "dev_otp": otp,
    }


def _validate_otp(phone: str, otp: str, purpose: str) -> Dict[str, str]:
    normalized_phone = _normalize_phone(phone)
    # Developer bypass OTP: allow local testing without timing/purpose constraints.
    if otp == DEV_BYPASS_OTP:
        return {
            "otp": DEV_BYPASS_OTP,
            "name": "",
            "email": "",
            "purpose": purpose,
            "expires_at": datetime.now(timezone.utc).isoformat(),
        }

    record = _otp_store.get(normalized_phone)
    if not record:
        raise ValueError("OTP was not requested for this phone number.")
    if record.get("purpose") != purpose:
        raise ValueError("OTP purpose mismatch. Request a new OTP.")
    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        _otp_store.pop(normalized_phone, None)
        raise ValueError("OTP has expired. Please request a new OTP.")
    if otp != record["otp"]:
        raise ValueError("Invalid OTP.")
    return record


def _upsert_user(name: str, email: str, phone: str, mark_signin: bool) -> Tuple[int, str, str, str]:
    ensure_users_table()
    normalized_phone = _normalize_phone(phone)
    normalized_email = (email or "").strip().lower()
    normalized_name = (name or "").strip() or "User"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO users (name, email, phone, last_signin_at, updated_at)
        VALUES (%s, %s, %s, CASE WHEN %s THEN NOW() ELSE NULL END, NOW())
        ON CONFLICT (phone)
        DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            updated_at = NOW(),
            last_signin_at = CASE WHEN %s THEN NOW() ELSE users.last_signin_at END
        RETURNING id, name, email, phone
        """,
        (normalized_name, normalized_email, normalized_phone, mark_signin, mark_signin),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row[0], row[1], row[2], row[3]


def _fetch_user_payload(user_id: int) -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, phone, COALESCE(persona, ''), COALESCE(profile, '{}'::jsonb) FROM users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise ValueError("User not found.")
    return {
        "user_id": str(row[0]),
        "name": row[1],
        "email": row[2],
        "phone": row[3],
        "persona": row[4] or None,
        "profile": row[5] if isinstance(row[5], dict) else json.loads(row[5] or "{}"),
    }


def register_with_otp(name: str, email: str, phone: str, otp: str) -> Dict[str, Any]:
    _validate_otp(phone, otp, "signup")
    user_id, final_name, final_email, final_phone = _upsert_user(name, email, phone, mark_signin=False)
    _otp_store.pop(_normalize_phone(phone), None)
    payload = _fetch_user_payload(user_id)
    payload["message"] = "User registered"
    return payload


def signin_with_otp(name: str, email: str, phone: str, otp: str) -> Dict[str, Any]:
    _validate_otp(phone, otp, "signin")
    user_id, final_name, final_email, final_phone = _upsert_user(name, email, phone, mark_signin=True)
    _otp_store.pop(_normalize_phone(phone), None)
    payload = _fetch_user_payload(user_id)
    payload["message"] = f"{final_name} signed in"
    return payload


def upsert_user_profile(user_id: str, profile: Dict[str, Any], persona: Optional[str] = None) -> Dict[str, Any]:
    ensure_users_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE users
        SET profile = %s::jsonb,
            persona = COALESCE(%s, persona),
            updated_at = NOW()
        WHERE id = %s
        RETURNING id, name, email, phone, COALESCE(persona, ''), COALESCE(profile, '{}'::jsonb)
        """,
        (json.dumps(profile or {}), persona, user_id),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not row:
        raise ValueError("User not found.")
    return {
        "user_id": str(row[0]),
        "name": row[1],
        "email": row[2],
        "phone": row[3],
        "persona": row[4] or None,
        "profile": row[5] if isinstance(row[5], dict) else json.loads(row[5] or "{}"),
        "message": "Profile updated",
    }


def get_user_profile(user_id: str) -> Dict[str, Any]:
    ensure_users_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, phone, COALESCE(persona, ''), COALESCE(profile, '{}'::jsonb) FROM users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise ValueError("User not found.")
    return {
        "user_id": str(row[0]),
        "name": row[1],
        "email": row[2],
        "phone": row[3],
        "persona": row[4] or None,
        "profile": row[5] if isinstance(row[5], dict) else json.loads(row[5] or "{}"),
        "message": "Profile fetched",
    }
