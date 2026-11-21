import io

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import StreamingResponse
from pydantic import EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, get_optional_user
from ..models import User
from ..schemas import BookingCreate, BookingListItem, BookingOut, BookingUpdate
from ..services.booking_service import (
    booking_out,
    cancel_booking,
    create_booking,
    get_booking_by_reference,
    list_bookings_by_email,
    list_bookings_by_user,
    summary_out,
    update_booking,
)

router = APIRouter(prefix="/api/bookings", tags=["bookings"])
me_router = APIRouter(prefix="/api/me", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create(
    payload: BookingCreate,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None
    return booking_out(create_booking(db, payload, user_id))


@router.get("", response_model=list[BookingListItem])
def list_by_email(email: EmailStr, db: Session = Depends(get_db)):
    return [summary_out(b) for b in list_bookings_by_email(db, email)]


@router.get("/{reference}", response_model=BookingOut)
def read(reference: str, email: EmailStr, db: Session = Depends(get_db)):
    return booking_out(get_booking_by_reference(db, reference, email))


@router.get("/{reference}/ticket", response_class=StreamingResponse)
def ticket(reference: str, email: EmailStr, db: Session = Depends(get_db)):
    """Generate a printable PNG boarding pass for this booking."""
    from ..lib.ticket import render_ticket

    booking = booking_out(get_booking_by_reference(db, reference, email))
    png = render_ticket(booking)
    return StreamingResponse(
        io.BytesIO(png),
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="aerotrip-{reference}.png"',
            "Cache-Control": "no-store",
        },
    )


@router.patch("/{booking_id}", response_model=BookingOut)
def update(
    booking_id: str,
    payload: BookingUpdate,
    email: EmailStr | None = None,
    reference: str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    return booking_out(update_booking(db, booking_id, email, reference, payload, current_user))


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel(
    booking_id: str,
    email: EmailStr | None = None,
    reference: str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    cancel_booking(db, booking_id, email, reference, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@me_router.get("/bookings", response_model=list[BookingListItem])
def list_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return [summary_out(b) for b in list_bookings_by_user(db, current_user.id)]
