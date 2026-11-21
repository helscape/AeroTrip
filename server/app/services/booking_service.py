from sqlalchemy import select, update
from sqlalchemy.orm import Session

from .. import models as m
from ..errors import ApiError
from ..lib.money import cents_to_units
from ..lib.reference import generate_reference
from ..models import new_id, utcnow
from ..schemas import BookingCreate, BookingUpdate, iso_date, iso_z


def booking_out(booking: m.Booking) -> dict:
    return {
        "id": booking.id,
        "reference": booking.reference,
        "status": booking.status,
        "tripType": booking.trip_type,
        "outboundFlight": flight_out(booking.outbound_flight),
        "returnFlight": flight_out(booking.return_flight) if booking.return_flight else None,
        "passengers": [
            {
                "id": p.id,
                "fullName": p.full_name,
                "dateOfBirth": iso_date(p.date_of_birth),
                "passportNumber": p.passport_number,
                "seatNo": p.seat_no,
            }
            for p in booking.passengers
        ],
        "contactEmail": booking.contact_email,
        "contactPhone": booking.contact_phone,
        "total": cents_to_units(booking.total_cents),
        "currency": booking.currency,
        "createdAt": iso_z(booking.created_at),
    }


def summary_out(booking: m.Booking) -> dict:
    return {
        "id": booking.id,
        "reference": booking.reference,
        "status": booking.status,
        "tripType": booking.trip_type,
        "contactEmail": booking.contact_email,
        "total": cents_to_units(booking.total_cents),
        "currency": booking.currency,
        "createdAt": iso_z(booking.created_at),
    }


# Imported late to keep the flight service free of booking imports.
from .flight_service import flight_out  # noqa: E402


def _unique_reference(db: Session) -> str:
    for _ in range(10):
        reference = generate_reference()
        exists = db.scalar(select(m.Booking.id).where(m.Booking.reference == reference))
        if not exists:
            return reference
    raise ApiError(500, "INTERNAL_ERROR", "Could not generate a unique booking reference")


def create_booking(
    db: Session, payload: BookingCreate, user_id: str | None = None
) -> m.Booking:
    count = len(payload.passengers)
    try:
        outbound = db.get(m.Flight, payload.outboundFlightId)
        if not outbound:
            raise ApiError(404, "NOT_FOUND", "Outbound flight not found")
        returning = None
        if payload.returnFlightId:
            if payload.returnFlightId == payload.outboundFlightId:
                raise ApiError(400, "BAD_REQUEST", "Outbound and return flights must differ")
            returning = db.get(m.Flight, payload.returnFlightId)
            if not returning:
                raise ApiError(404, "NOT_FOUND", "Return flight not found")

        flights = [f for f in (outbound, returning) if f]
        if any(f.cabin_class != payload.cabinClass for f in flights):
            raise ApiError(400, "BAD_REQUEST", "Flight cabin class does not match the booking")

        total_cents = sum(f.price_cents for f in flights) * count
        currency = outbound.currency

        # Conditional UPDATE + rowcount check makes seat decrement atomic.
        for flight in flights:
            result = db.execute(
                update(m.Flight)
                .where(
                    m.Flight.id == flight.id,
                    m.Flight.seats_available >= count,
                )
                .values(
                    seats_available=m.Flight.seats_available - count,
                    updated_at=utcnow(),
                )
            )
            if result.rowcount != 1:
                raise ApiError(409, "CONFLICT", "Not enough seats available")

        booking = m.Booking(
            id=new_id("bkg"),
            reference=_unique_reference(db),
            outbound_flight_id=outbound.id,
            return_flight_id=returning.id if returning else None,
            trip_type=payload.tripType,
            cabin_class=payload.cabinClass,
            contact_email=str(payload.contactEmail).strip().lower(),
            contact_phone=payload.contactPhone,
            passenger_count=count,
            total_cents=total_cents,
            currency=currency,
            status="confirmed",
            user_id=user_id,
            created_at=utcnow(),
            updated_at=utcnow(),
            passengers=[
                m.Passenger(
                    id=new_id("psg"),
                    full_name=p.fullName,
                    date_of_birth=p.dateOfBirth,
                    passport_number=p.passportNumber,
                )
                for p in payload.passengers
            ],
        )
        db.add(booking)
        db.flush()
        booking_id = booking.id
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.expire_all()
    return db.get(m.Booking, booking_id)


def get_booking_by_reference(db: Session, reference: str, email: str) -> m.Booking:
    booking = db.scalar(
        select(m.Booking).where(
            m.Booking.reference == reference.strip().upper(),
            m.Booking.contact_email == email.strip().lower(),
        )
    )
    if not booking:
        raise ApiError(404, "NOT_FOUND", "Booking not found")
    return booking


def list_bookings_by_email(db: Session, email: str) -> list[m.Booking]:
    return list(
        db.scalars(
            select(m.Booking)
            .where(m.Booking.contact_email == email.strip().lower())
            .order_by(m.Booking.created_at.desc())
        ).all()
    )


def list_bookings_by_user(db: Session, user_id: str) -> list[m.Booking]:
    return list(
        db.scalars(
            select(m.Booking)
            .where(m.Booking.user_id == user_id)
            .order_by(m.Booking.created_at.desc())
        ).all()
    )


def _authorized_booking(
    db: Session,
    booking_id: str,
    email: str | None,
    reference: str | None,
    user: m.User | None = None,
) -> m.Booking:
    """Authenticate a booking mutation by owner token or by guest email+reference."""
    booking = db.get(m.Booking, booking_id)
    if not booking:
        raise ApiError(404, "NOT_FOUND", "Booking not found")

    if user is not None and booking.user_id == user.id:
        return booking

    if not email or not reference:
        raise ApiError(
            401,
            "UNAUTHORIZED",
            "Email and booking reference are required to manage a guest booking",
        )
    if (
        booking.reference != reference.strip().upper()
        or booking.contact_email != email.strip().lower()
    ):
        raise ApiError(404, "NOT_FOUND", "Booking not found")
    return booking


def update_booking(
    db: Session,
    booking_id: str,
    email: str | None,
    reference: str | None,
    payload: BookingUpdate,
    user: m.User | None = None,
) -> m.Booking:
    try:
        booking = _authorized_booking(db, booking_id, email, reference, user)
        if booking.status == "cancelled":
            raise ApiError(409, "CONFLICT", "A cancelled booking cannot be updated")
        booking.contact_email = str(payload.contactEmail).strip().lower()
        booking.contact_phone = payload.contactPhone
        booking.updated_at = utcnow()
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.expire_all()
    return db.get(m.Booking, booking_id)


def cancel_booking(
    db: Session,
    booking_id: str,
    email: str | None,
    reference: str | None,
    user: m.User | None = None,
) -> None:
    try:
        booking = _authorized_booking(db, booking_id, email, reference, user)
        if booking.status != "confirmed":
            raise ApiError(409, "CONFLICT", "Only confirmed bookings can be cancelled")
        count = booking.passenger_count
        flight_ids = [f.id for f in (booking.outbound_flight, booking.return_flight) if f]
        for flight_id in flight_ids:
            db.execute(
                update(m.Flight)
                .where(m.Flight.id == flight_id)
                .values(
                    seats_available=m.Flight.seats_available + count,
                    updated_at=utcnow(),
                )
            )
        booking.status = "cancelled"
        booking.updated_at = utcnow()
        db.commit()
    except Exception:
        db.rollback()
        raise
