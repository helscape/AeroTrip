from datetime import date, datetime, timezone
from uuid import uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    """Naive UTC datetime — MariaDB DATETIME stores no timezone."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=utcnow, onupdate=utcnow
    )


class Airport(Base):
    __tablename__ = "airports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: new_id("apt"))
    code: Mapped[str] = mapped_column(String(3), nullable=False, unique=True, index=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)


class Airline(Base):
    __tablename__ = "airlines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: new_id("air"))
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)


class Flight(TimestampMixin, Base):
    __tablename__ = "flights"
    __table_args__ = (
        Index("idx_flights_route_date", "origin_code", "destination_code", "departure_at"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("flt"))
    airline_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("airlines.id"), nullable=False
    )
    flight_number: Mapped[str] = mapped_column(String(20), nullable=False)
    origin_code: Mapped[str] = mapped_column(
        String(3), ForeignKey("airports.code"), nullable=False
    )
    destination_code: Mapped[str] = mapped_column(
        String(3), ForeignKey("airports.code"), nullable=False
    )
    departure_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    arrival_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    stops: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cabin_class: Mapped[str] = mapped_column(String(16), nullable=False)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    seats_available: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")

    airline: Mapped[Airline] = relationship(lazy="selectin")
    origin: Mapped[Airport] = relationship(foreign_keys=[origin_code], lazy="selectin")
    destination: Mapped[Airport] = relationship(
        foreign_keys=[destination_code], lazy="selectin"
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("usr"))
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(100), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role: Mapped[str] = mapped_column(
        String(16), nullable=False, default="user", server_default="user"
    )

    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")


class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("bkg"))
    reference: Mapped[str] = mapped_column(String(12), nullable=False, unique=True, index=True)
    outbound_flight_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("flights.id"), nullable=False
    )
    return_flight_id: Mapped[str | None] = mapped_column(
        String(40), ForeignKey("flights.id"), nullable=True
    )
    trip_type: Mapped[str] = mapped_column(String(16), nullable=False)
    cabin_class: Mapped[str] = mapped_column(String(16), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    passenger_count: Mapped[int] = mapped_column(Integer, nullable=False)
    total_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="confirmed")
    user_id: Mapped[str | None] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=True, index=True
    )

    user: Mapped["User | None"] = relationship(back_populates="bookings")
    outbound_flight: Mapped[Flight] = relationship(
        foreign_keys=[outbound_flight_id], lazy="selectin"
    )
    return_flight: Mapped[Flight | None] = relationship(
        foreign_keys=[return_flight_id], lazy="selectin"
    )
    passengers: Mapped[list["Passenger"]] = relationship(
        back_populates="booking",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Passenger(Base):
    __tablename__ = "passengers"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("psg"))
    booking_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    passport_number: Mapped[str | None] = mapped_column(String(40), nullable=True)
    seat_no: Mapped[str | None] = mapped_column(String(10), nullable=True)

    booking: Mapped[Booking] = relationship(back_populates="passengers")
