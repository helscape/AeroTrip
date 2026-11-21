import secrets

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .errors import ApiError
from .lib.security import decode_access_token
from .models import User


def get_db_session(db: Session = Depends(get_db)) -> Session:
    return db


def _bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None
    return token.strip()


def get_optional_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User | None:
    """Resolve a Bearer token to a user, returning None when it is absent/invalid.

    Used by the public booking endpoints so a token can enrich a request without
    making authentication mandatory (guest checkout stays unchanged).
    """
    token = _bearer_token(authorization)
    if not token:
        return None
    user_id = decode_access_token(token)
    if not user_id:
        return None
    return db.get(User, user_id)


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise ApiError(401, "UNAUTHORIZED", "Invalid or missing authentication token")
    return user


def require_admin(
    x_admin_key: str | None = Header(default=None, alias="x-admin-key"),
    current_user: User | None = Depends(get_optional_user),
) -> None:
    """Admin access via the API key or a signed-in user with the admin role."""
    if x_admin_key and secrets.compare_digest(x_admin_key, settings.admin_api_key):
        return
    if current_user and current_user.role == "admin":
        return
    raise ApiError(401, "UNAUTHORIZED", "Admin access required")
