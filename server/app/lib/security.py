"""Password hashing and JWT access-token helpers."""

import base64
import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from ..config import settings


def _password_bytes(password: str) -> bytes:
    """SHA-256 pre-hash, base64 encoded, so any password length is safe for bcrypt.

    bcrypt only consumes the first 72 bytes of input. Hashing first avoids that
    truncation (and the NUL-byte issues of feeding raw digests to bcrypt).
    """
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_password_bytes(password), password_hash.encode("ascii"))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=settings.jwt_ttl_hours),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> str | None:
    """Return the user id in a valid token, or None for any invalid/expired token."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    user_id = payload.get("sub")
    return user_id if isinstance(user_id, str) and user_id else None
