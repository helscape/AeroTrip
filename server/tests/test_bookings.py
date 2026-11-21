from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import models as m


def first_flight_ids(client: TestClient, *, round_trip: bool = False):
    depart = date.today() + timedelta(days=14)
    params = {
        "origin": "CGK",
        "destination": "DPS",
        "departDate": depart.isoformat(),
    }
    if round_trip:
        params["returnDate"] = (date.today() + timedelta(days=21)).isoformat()
    body = client.get("/api/flights/search", params=params).json()
    outbound = body["outbound"][0]
    return outbound, (body["return"][0] if round_trip else None)


def booking_payload(flight, returning=None, *, passengers: int = 1, email: str = "you@example.com"):
    payload = {
        "tripType": "round-trip" if returning else "one-way",
        "outboundFlightId": flight["id"],
        "cabinClass": flight["cabinClass"],
        "contactEmail": email,
        "contactPhone": "+62 812 0000 0000",
        "passengers": [
            {
                "fullName": f"Traveler {i + 1}",
                "dateOfBirth": "1995-05-14",
                "passportNumber": f"A{i + 1234567}",
            }
            for i in range(passengers)
        ],
    }
    if returning:
        payload["returnFlightId"] = returning["id"]
    return payload


def test_create_booking_decrements_seats(client: TestClient, seeded_db: Session):
    flight, _ = first_flight_ids(client)
    seats_before = client.get(f"/api/flights/{flight['id']}").json()["seatsAvailable"]

    response = client.post("/api/bookings", json=booking_payload(flight, passengers=2))
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["reference"].startswith("AT-")
    assert len(body["reference"]) == 9
    assert body["status"] == "confirmed"
    assert len(body["passengers"]) == 2
    assert body["total"] == flight["price"] * 2
    assert client.get(f"/api/flights/{flight['id']}").json()["seatsAvailable"] == seats_before - 2


def test_round_trip_total(client: TestClient, seeded_db: Session):
    outbound, returning = first_flight_ids(client, round_trip=True)
    response = client.post("/api/bookings", json=booking_payload(outbound, returning))
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["returnFlight"] is not None
    assert body["total"] == outbound["price"] + returning["price"]


def test_insufficient_seats(client: TestClient, seeded_db: Session):
    flight, _ = first_flight_ids(client)
    db_flight = seeded_db.get(m.Flight, flight["id"])
    db_flight.seats_available = 1
    seeded_db.commit()

    response = client.post("/api/bookings", json=booking_payload(flight, passengers=2))
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CONFLICT"


def test_lookup_by_reference_and_email(client: TestClient, seeded_db: Session):
    flight, _ = first_flight_ids(client)
    created = client.post(
        "/api/bookings", json=booking_payload(flight, email="ayu@example.com")
    ).json()

    found = client.get(
        f"/api/bookings/{created['reference']}", params={"email": "AYU@example.com"}
    )
    assert found.status_code == 200
    assert found.json()["id"] == created["id"]

    missing = client.get(
        f"/api/bookings/{created['reference']}", params={"email": "nobody@example.com"}
    )
    assert missing.status_code == 404

    listed = client.get("/api/bookings", params={"email": "ayu@example.com"})
    assert [b["reference"] for b in listed.json()] == [created["reference"]]


def test_update_contact(client: TestClient, seeded_db: Session):
    flight, _ = first_flight_ids(client)
    created = client.post("/api/bookings", json=booking_payload(flight)).json()

    response = client.patch(
        f"/api/bookings/{created['id']}",
        params={"email": "you@example.com", "reference": created["reference"]},
        json={"contactEmail": "new@example.com", "contactPhone": "+1 555 0100"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["contactEmail"] == "new@example.com"
    assert response.json()["contactPhone"] == "+1 555 0100"


def test_cancel_restores_seats(client: TestClient, seeded_db: Session):
    outbound, returning = first_flight_ids(client, round_trip=True)
    seats_out = client.get(f"/api/flights/{outbound['id']}").json()["seatsAvailable"]
    seats_ret = client.get(f"/api/flights/{returning['id']}").json()["seatsAvailable"]

    created = client.post(
        "/api/bookings", json=booking_payload(outbound, returning, passengers=3)
    ).json()
    response = client.delete(
        f"/api/bookings/{created['id']}",
        params={"email": "you@example.com", "reference": created["reference"]},
    )
    assert response.status_code == 204, response.text

    booking = client.get(
        f"/api/bookings/{created['reference']}", params={"email": "you@example.com"}
    ).json()
    assert booking["status"] == "cancelled"
    assert client.get(f"/api/flights/{outbound['id']}").json()["seatsAvailable"] == seats_out
    assert client.get(f"/api/flights/{returning['id']}").json()["seatsAvailable"] == seats_ret

    again = client.delete(
        f"/api/bookings/{created['id']}",
        params={"email": "you@example.com", "reference": created["reference"]},
    )
    assert again.status_code == 409


def test_ticket_image_is_generated(client: TestClient, seeded_db: Session):
    flight, _ = first_flight_ids(client)
    created = client.post("/api/bookings", json=booking_payload(flight)).json()

    response = client.get(
        f"/api/bookings/{created['reference']}/ticket",
        params={"email": "you@example.com"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(b"\x89PNG\r\n\x1a\n")
    assert len(response.content) > 10_000

    missing = client.get(
        f"/api/bookings/{created['reference']}/ticket",
        params={"email": "nobody@example.com"},
    )
    assert missing.status_code == 404


def test_invalid_payload(client: TestClient, seeded_db: Session):
    response = client.post("/api/bookings", json={"tripType": "one-way", "passengers": []})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
