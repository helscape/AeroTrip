from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..errors import ApiError
from ..lib.security import create_access_token, hash_password, verify_password
from ..models import User, new_id, utcnow
from ..schemas import TokenOut, UserLogin, UserOut, UserRegister, UserUpdate, iso_z

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_out(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "phone": user.phone,
        "role": user.role,
        "createdAt": iso_z(user.created_at),
    }


def _normalized_email(email: str) -> str:
    return str(email).strip().lower()


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    email = _normalized_email(payload.email)
    if db.scalar(select(User.id).where(User.email == email)):
        raise ApiError(409, "CONFLICT", "Email already registered")

    user = User(
        id=new_id("usr"),
        email=email,
        password_hash=hash_password(payload.password),
        full_name=payload.fullName.strip(),
        phone=payload.phone,
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ApiError(409, "CONFLICT", "Email already registered")
    db.refresh(user)
    return {"token": create_access_token(user.id), "user": user_out(user)}


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == _normalized_email(payload.email)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise ApiError(401, "UNAUTHORIZED", "Invalid email or password")
    return {"token": create_access_token(user.id), "user": user_out(user)}


@router.get("/me", response_model=UserOut)
def read_me(user: User = Depends(get_current_user)):
    return user_out(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = db.get(User, user.id)
    if updated is None:
        raise ApiError(401, "UNAUTHORIZED", "Invalid or missing authentication token")
    provided = payload.model_fields_set
    if "fullName" in provided and payload.fullName is not None:
        updated.full_name = payload.fullName.strip()
    if "phone" in provided:
        updated.phone = payload.phone
    updated.updated_at = utcnow()
    db.commit()
    db.refresh(updated)
    return user_out(updated)
