from datetime import datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models as m
from ..database import transaction
from ..errors import ApiError
from ..lib.money import cents_to_units, units_to_cents
from ..models import new_id, utcnow
from ..schemas import AdminFlightCreate, AdminFlightUpdate, FlightOut, SearchParams, iso_z


def flight_out(flight: m.Flight) -> dict:
    return {
        "id": flight.id,
        "airline": {"code": flight.airline.code, "name": flight.airline.name},
        "flightNumber": flight.flight_number,
        "from": {
            "code": flight.origin.code,
            "city": flight.origin.city,
            "country": flight.origin.country,
            "name": flight.origin.name,
        },
        "to": {
            "code": flight.destination.code,
            "city": flight.destination.city,
            "country": flight.destination.country,
            "name": flight.destination.name,
        },
        "departureAt": iso_z(flight.departure_at),
        "arrivalAt": iso_z(flight.arrival_at),
        "durationMinutes": flight.duration_minutes,
        "stops": flight.stops,
        "cabinClass": flight.cabin_class,
        "price": cents_to_units(flight.price_cents),
        "currency": flight.currency,
        "seatsAvailable": flight.seats_available,
    }


def _query_flights(
    db: Session,
    *,
    origin: str,
    destination: str,
    day: datetime,
    params: SearchParams,
) -> list[m.Flight]:
    start = datetime.combine(day.date(), time.min)
    end = start + timedelta(days=1)
    stmt = (
        select(m.Flight)
        .join(m.Airline)
        .where(
            m.Flight.origin_code == origin.upper(),
            m.Flight.destination_code == destination.upper(),
            m.Flight.departure_at >= start,
            m.Flight.departure_at < end,
            m.Flight.seats_available >= params.passengers,
            m.Flight.status == "scheduled",
            m.Flight.cabin_class == params.cabin,
        )
    )
    if params.maxStops is not None:
        stmt = stmt.where(m.Flight.stops <= params.maxStops)
    if params.airline:
        stmt = stmt.where(m.Airline.code == params.airline.upper())
    if params.maxPrice is not None:
        stmt = stmt.where(m.Flight.price_cents <= units_to_cents(params.maxPrice))

    order_by = {
        "price": m.Flight.price_cents.asc(),
        "duration": m.Flight.duration_minutes.asc(),
        "departure": m.Flight.departure_at.asc(),
    }[params.sort]
    stmt = stmt.order_by(order_by, m.Flight.id.asc())
    return list(db.scalars(stmt).all())


def search_flights(db: Session, params: SearchParams) -> dict:
    outbound = _query_flights(
        db,
        origin=params.origin,
        destination=params.destination,
        day=datetime.combine(params.departDate, time.min),
        params=params,
    )
    returning = None
    if params.returnDate:
        returning = _query_flights(
            db,
            origin=params.destination,
            destination=params.origin,
            day=datetime.combine(params.returnDate, time.min),
            params=params,
        )
    return {
        "outbound": [flight_out(flight) for flight in outbound],
        "return": [flight_out(flight) for flight in returning] if returning is not None else None,
    }


def get_flight(db: Session, flight_id: str) -> m.Flight:
    flight = db.get(m.Flight, flight_id)
    if not flight:
        raise ApiError(404, "NOT_FOUND", "Flight not found")
    return flight


def list_airports(db: Session, q: str | None, limit: int = 20) -> list[dict]:
    stmt = select(m.Airport)
    if q:
        pattern = f"%{q.strip().upper()}%"
        stmt = stmt.where(
            m.Airport.code.like(pattern)
            | m.Airport.city.like(pattern)
            | m.Airport.name.like(pattern)
            | m.Airport.country.like(pattern)
        )
    stmt = stmt.order_by(m.Airport.city.asc()).limit(limit)
    return [
        {"code": a.code, "city": a.city, "country": a.country, "name": a.name}
        for a in db.scalars(stmt).all()
    ]


def list_flights(db: Session, limit: int = 100) -> list[dict]:
    flights = db.scalars(
        select(m.Flight).order_by(m.Flight.departure_at.desc()).limit(limit)
    ).all()
    return [flight_out(flight) for flight in flights]


def _find_airline(db: Session, code: str) -> m.Airline:
    airline = db.scalar(select(m.Airline).where(m.Airline.code == code.upper()))
    if not airline:
        raise ApiError(400, "BAD_REQUEST", f"Unknown airline code: {code}")
    return airline


def _find_airport(db: Session, code: str) -> m.Airport:
    airport = db.scalar(select(m.Airport).where(m.Airport.code == code.upper()))
    if not airport:
        raise ApiError(400, "BAD_REQUEST", f"Unknown airport code: {code}")
    return airport


def create_flight(db: Session, payload: AdminFlightCreate) -> m.Flight:
    with transaction(db):
        airline = _find_airline(db, payload.airlineCode)
        origin = _find_airport(db, payload.originCode)
        destination = _find_airport(db, payload.destinationCode)
        flight = m.Flight(
            id=new_id("flt"),
            airline_id=airline.id,
            flight_number=payload.flightNumber,
            origin_code=origin.code,
            destination_code=destination.code,
            departure_at=payload.departureAt.replace(tzinfo=None),
            arrival_at=payload.arrivalAt.replace(tzinfo=None),
            duration_minutes=payload.durationMinutes,
            stops=payload.stops,
            cabin_class=payload.cabinClass,
            price_cents=units_to_cents(payload.price),
            currency=payload.currency.upper(),
            seats_available=payload.seatsAvailable,
            status=payload.status,
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(flight)
        db.flush()
    return flight


def update_flight(db: Session, flight_id: str, payload: AdminFlightUpdate) -> m.Flight:
    with transaction(db):
        flight = get_flight(db, flight_id)
        data = payload.model_dump(exclude_unset=True)
        if "airlineCode" in data:
            flight.airline_id = _find_airline(db, data.pop("airlineCode")).id
        if "originCode" in data:
            flight.origin_code = _find_airport(db, data.pop("originCode")).code
        if "destinationCode" in data:
            flight.destination_code = _find_airport(db, data.pop("destinationCode")).code
        if "price" in data:
            flight.price_cents = units_to_cents(data.pop("price"))
        if "currency" in data:
            data["currency"] = data["currency"].upper()

        field_map = {
            "flightNumber": "flight_number",
            "departureAt": "departure_at",
            "arrivalAt": "arrival_at",
            "durationMinutes": "duration_minutes",
            "stops": "stops",
            "cabinClass": "cabin_class",
            "seatsAvailable": "seats_available",
            "status": "status",
        }
        for key, value in data.items():
            if key in ("departureAt", "arrivalAt"):
                value = value.replace(tzinfo=None)
            setattr(flight, field_map.get(key, key), value)

        if flight.origin_code == flight.destination_code:
            raise ApiError(400, "BAD_REQUEST", "originCode and destinationCode must differ")
        if flight.arrival_at <= flight.departure_at:
            raise ApiError(400, "BAD_REQUEST", "arrivalAt must be after departureAt")
        flight.updated_at = utcnow()
        db.flush()
    return flight


def delete_flight(db: Session, flight_id: str) -> None:
    from sqlalchemy import func, or_, select as sa_select

    with transaction(db):
        flight = get_flight(db, flight_id)
        used = db.scalar(
            sa_select(func.count()).select_from(m.Booking).where(
                or_(
                    m.Booking.outbound_flight_id == flight_id,
                    m.Booking.return_flight_id == flight_id,
                )
            )
        )
        if used:
            raise ApiError(
                409,
                "CONFLICT",
                "Flight is referenced by a booking and cannot be deleted",
            )
        db.delete(flight)
