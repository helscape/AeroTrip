"""Create tables and load a richer, procedurally generated sample inventory.

Run from the server directory:

    python seed.py

Flight records are generated with a fixed random seed, so the dataset is
varied but reproducible. Values are synthetic: airline codes and airports are
real, schedules, fares and seat counts are invented for the demo.
"""

from datetime import date, datetime, time, timedelta
from random import Random

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.lib.money import units_to_cents
from app.lib.security import hash_password
from app.models import Airport, Airline, Booking, Flight, Passenger, User, new_id, utcnow

AIRPORTS = [
    ("CGK", "Jakarta", "Indonesia", "Soekarno-Hatta International"),
    ("DPS", "Denpasar", "Indonesia", "Ngurah Rai International"),
    ("SUB", "Surabaya", "Indonesia", "Juanda International"),
    ("SIN", "Singapore", "Singapore", "Changi Airport"),
    ("KUL", "Kuala Lumpur", "Malaysia", "Kuala Lumpur International"),
    ("BKK", "Bangkok", "Thailand", "Suvarnabhumi Airport"),
    ("HKT", "Phuket", "Thailand", "Phuket International"),
    ("SGN", "Ho Chi Minh City", "Vietnam", "Tan Son Nhat International"),
    ("HAN", "Hanoi", "Vietnam", "Noi Bai International"),
    ("MNL", "Manila", "Philippines", "Ninoy Aquino International"),
    ("NRT", "Tokyo", "Japan", "Narita International"),
    ("ICN", "Seoul", "South Korea", "Incheon International"),
    ("TPE", "Taipei", "Taiwan", "Taoyuan International"),
    ("HKG", "Hong Kong", "Hong Kong", "Hong Kong International"),
    ("DEL", "Delhi", "India", "Indira Gandhi International"),
    ("BOM", "Mumbai", "India", "Chhatrapati Shivaji Maharaj"),
    ("DXB", "Dubai", "United Arab Emirates", "Dubai International"),
    ("DOH", "Doha", "Qatar", "Hamad International"),
    ("LHR", "London", "United Kingdom", "Heathrow Airport"),
    ("CDG", "Paris", "France", "Charles de Gaulle Airport"),
    ("AMS", "Amsterdam", "Netherlands", "Schiphol Airport"),
    ("FRA", "Frankfurt", "Germany", "Frankfurt Airport"),
    ("JFK", "New York", "United States", "John F. Kennedy International"),
    ("LAX", "Los Angeles", "United States", "Los Angeles International"),
    ("SFO", "San Francisco", "United States", "San Francisco International"),
    ("SYD", "Sydney", "Australia", "Kingsford Smith Airport"),
    ("MEL", "Melbourne", "Australia", "Tullamarine Airport"),
    ("PER", "Perth", "Australia", "Perth Airport"),
    ("AKL", "Auckland", "New Zealand", "Auckland Airport"),
]

AIRLINES = [
    ("GA", "Garuda Indonesia"),
    ("QG", "Citilink"),
    ("JT", "Lion Air"),
    ("ID", "Batik Air"),
    ("SQ", "Singapore Airlines"),
    ("MH", "Malaysia Airlines"),
    ("TG", "Thai Airways"),
    ("JL", "Japan Airlines"),
    ("NH", "ANA"),
    ("KE", "Korean Air"),
    ("OZ", "Asiana Airlines"),
    ("AF", "Air France"),
    ("EK", "Emirates"),
    ("QR", "Qatar Airways"),
    ("QF", "Qantas"),
    ("BA", "British Airways"),
    ("UA", "United Airlines"),
    ("DL", "Delta Air Lines"),
    ("CX", "Cathay Pacific"),
    ("VA", "Virgin Australia"),
    ("AI", "Air India"),
]

# origin, destination, typical duration (min), typical economy fare (USD), carriers
ROUTE_CATALOG = [
    ("CGK", "DPS", 115, 150, ("GA", "QG", "JT", "ID")),
    ("CGK", "SIN", 105, 195, ("SQ", "GA", "QG")),
    ("CGK", "KUL", 120, 145, ("MH", "GA", "JT")),
    ("CGK", "BKK", 195, 265, ("TG", "GA", "JT")),
    ("CGK", "NRT", 420, 585, ("JL", "GA", "NH")),
    ("CGK", "ICN", 390, 530, ("KE", "OZ", "GA")),
    ("CGK", "CDG", 800, 830, ("AF", "GA", "EK")),
    ("CGK", "DXB", 520, 545, ("EK", "GA", "QR")),
    ("CGK", "SYD", 480, 610, ("QF", "GA")),
    ("CGK", "HKT", 210, 230, ("TG", "JT")),
    ("CGK", "SGN", 180, 210, ("QG", "GA")),
    ("CGK", "MNL", 210, 240, ("GA", "JT")),
    ("CGK", "HKG", 260, 310, ("CX", "GA")),
    ("CGK", "SUB", 95, 105, ("GA", "QG", "JT")),
    ("DPS", "SIN", 115, 165, ("SQ", "QG", "GA")),
    ("DPS", "KUL", 180, 185, ("MH", "JT")),
    ("DPS", "NRT", 450, 620, ("JL", "GA")),
    ("SIN", "BKK", 140, 185, ("SQ", "TG")),
    ("SIN", "NRT", 420, 505, ("SQ", "JL", "NH")),
    ("SIN", "LHR", 880, 840, ("BA", "SQ")),
    ("SIN", "SYD", 480, 590, ("SQ", "QF")),
    ("NRT", "ICN", 140, 205, ("JL", "KE", "OZ")),
    ("NRT", "LAX", 570, 760, ("JL", "UA", "DL")),
    ("HKG", "LHR", 730, 790, ("BA", "CX")),
    ("DXB", "JFK", 830, 745, ("EK", "UA")),
    ("DXB", "LHR", 415, 610, ("EK", "BA")),
    ("DOH", "CDG", 385, 690, ("QR", "AF")),
    ("LHR", "JFK", 480, 640, ("BA", "UA", "DL")),
    ("LHR", "AMS", 60, 120, ("BA", "AF")),
    ("JFK", "LAX", 345, 420, ("UA", "DL")),
    ("SYD", "MEL", 75, 115, ("QF", "VA")),
    ("SYD", "AKL", 185, 260, ("QF", "NH")),
    ("MEL", "PER", 220, 250, ("QF", "VA")),
    ("DEL", "BOM", 120, 130, ("AI", "CX")),
]

CABIN_MULTIPLIER = {"economy": 1.0, "premium": 1.55, "business": 2.5, "first": 3.6}
CABIN_WEIGHTS = (("economy", 0.70), ("premium", 0.18), ("business", 0.09), ("first", 0.03))
RANDOM_SEED = 20261121

# Seeded accounts. The API identifies users by email, so the requested
# admin:admin and tourist:tourist pairs map to these addresses.
ACCOUNTS = [
    # email, password, full name, role
    ("admin@aerotrip.test", "admin", "AeroTrip Admin", "admin"),
    ("tourist@aerotrip.test", "tourist", "Demo Tourist", "user"),
    ("demo@aerotrip.test", "demo1234", "Demo Traveler", "user"),
]


def reset(db: Session) -> None:
    for model in (Passenger, Booking, User, Flight, Airline, Airport):
        db.execute(delete(model))
    db.commit()


def _seed_users(db: Session) -> None:
    for email, password, full_name, role in ACCOUNTS:
        if db.scalar(select(User.id).where(User.email == email)):
            continue
        db.add(
            User(
                id=new_id("usr"),
                email=email,
                password_hash=hash_password(password),
                full_name=full_name,
                phone=None,
                role=role,
                created_at=utcnow(),
                updated_at=utcnow(),
            )
        )


def _weighted_cabin(rng: Random) -> str:
    roll = rng.random()
    cumulative = 0.0
    for cabin, weight in CABIN_WEIGHTS:
        cumulative += weight
        if roll <= cumulative:
            return cabin
    return "economy"


def _generate_flights(
    db: Session,
    airlines: dict[str, Airline],
    *,
    days: int,
    per_route: int,
    reciprocals: bool,
) -> int:
    """Generate flights across a forward-looking window. Returns the row count."""
    rng = Random(RANDOM_SEED)
    today = date.today()
    now = utcnow()
    counter = 0

    for offset in range(1, days + 1):
        day = today + timedelta(days=offset)
        for origin, destination, duration, base_price, carriers in ROUTE_CATALOG:
            directions = [(origin, destination)]
            if reciprocals:
                directions.append((destination, origin))

            for from_code, to_code in directions:
                for index in range(per_route):
                    # The first flight of each route/day is always a direct
                    # economy fare so filters and search always have a result.
                    cabin = "economy" if index == 0 else _weighted_cabin(rng)
                    stops = 0 if index == 0 else rng.choices((0, 1, 2), weights=(0.72, 0.23, 0.05))[0]

                    carrier = carriers[index % len(carriers)] if index < len(carriers) else rng.choice(carriers)
                    number = f"{carrier} {rng.randint(100, 989)}"

                    hour = rng.randrange(0, 24)
                    minute = rng.choice((0, 15, 30, 45))
                    departure = datetime.combine(day, time(hour=hour, minute=minute))
                    actual_duration = max(45, round(duration * rng.uniform(0.92, 1.14)))
                    arrival = departure + timedelta(minutes=actual_duration)

                    fare = base_price * CABIN_MULTIPLIER[cabin]
                    fare *= rng.uniform(0.85, 1.18)
                    if stops:
                        fare *= 0.90
                    price = int(round(fare / 5) * 5)

                    counter += 1
                    db.add(
                        Flight(
                            id=f"flt_{from_code}{to_code}_{day:%Y%m%d}_{counter}",
                            airline_id=airlines[carrier].id,
                            flight_number=number,
                            origin_code=from_code,
                            destination_code=to_code,
                            departure_at=departure,
                            arrival_at=arrival,
                            duration_minutes=actual_duration,
                            stops=stops,
                            cabin_class=cabin,
                            price_cents=units_to_cents(price),
                            currency="USD",
                            seats_available=rng.randint(6, 85),
                            status="scheduled",
                            created_at=now,
                            updated_at=now,
                        )
                    )
    return counter


def seed_data(db: Session, *, compact: bool = False) -> None:
    """Load the demo dataset. `compact` keeps tests fast with a smaller window."""
    reset(db)
    _seed_users(db)
    db.add_all(
        Airport(id=f"apt_{code.lower()}", code=code, city=city, country=country, name=name)
        for code, city, country, name in AIRPORTS
    )
    db.add_all(
        Airline(id=f"air_{code.lower()}", code=code, name=name) for code, name in AIRLINES
    )
    db.flush()

    airlines = {a.code: a for a in db.query(Airline).all()}
    count = _generate_flights(
        db,
        airlines,
        days=28 if compact else 45,
        per_route=1 if compact else 3,
        reciprocals=True,
    )
    db.commit()
    return count


def main() -> None:
    init_db()
    with SessionLocal() as db:
        count = seed_data(db)
    print(f"Seeded {len(AIRPORTS)} airports, {len(AIRLINES)} airlines and {count} flights.")


if __name__ == "__main__":
    main()
