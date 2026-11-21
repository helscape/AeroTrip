from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models as m
from app.config import settings


def test_health(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_airport_search(client: TestClient, seeded_db: Session):
    assert client.get("/api/airports?q=jak").json()[0]["code"] == "CGK"
    assert len(client.get("/api/airports").json()) >= 20


def test_search_one_way(client: TestClient, seeded_db: Session):
    day = date.today() + timedelta(days=14)
    response = client.get(
        "/api/flights/search",
        params={"origin": "CGK", "destination": "DPS", "departDate": day.isoformat()},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["return"] is None
    assert len(body["outbound"]) >= 1
    prices = [flight["price"] for flight in body["outbound"]]
    assert prices == sorted(prices)
    assert all(
        flight["from"]["code"] == "CGK" and flight["to"]["code"] == "DPS"
        for flight in body["outbound"]
    )
    assert body["outbound"][0]["from"]["code"] == "CGK"
    assert body["outbound"][0]["to"]["code"] == "DPS"


def test_search_round_trip_and_filters(client: TestClient, seeded_db: Session):
    depart = date.today() + timedelta(days=14)
    back = date.today() + timedelta(days=21)
    response = client.get(
        "/api/flights/search",
        params={
            "origin": "CGK",
            "destination": "DPS",
            "departDate": depart.isoformat(),
            "returnDate": back.isoformat(),
            "maxStops": 0,
            "maxPrice": 180,
            "sort": "duration",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["return"]
    assert all(f["stops"] == 0 and f["price"] <= 180 for f in body["outbound"])


def test_search_validation(client: TestClient, seeded_db: Session):
    response = client.get(
        "/api/flights/search",
        params={"origin": "CGK", "destination": "CGK", "departDate": date.today().isoformat()},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_search_no_results(client: TestClient, seeded_db: Session):
    response = client.get(
        "/api/flights/search",
        params={
            "origin": "CGK",
            "destination": "DPS",
            "departDate": (date.today() + timedelta(days=400)).isoformat(),
        },
    )
    assert response.status_code == 200
    assert response.json()["outbound"] == []


def test_flight_detail(client: TestClient, seeded_db: Session):
    flight = seeded_db.scalar(select(m.Flight).limit(1))
    response = client.get(f"/api/flights/{flight.id}")
    assert response.status_code == 200
    assert response.json()["id"] == flight.id
    assert response.json()["airline"]["name"]


def test_admin_requires_key(client: TestClient, seeded_db: Session):
    assert client.post("/api/admin/flights", json={}).status_code == 401
    assert (
        client.post("/api/admin/flights", headers={"x-admin-key": "wrong"}, json={}).status_code
        == 401
    )


def test_admin_crud(client: TestClient, seeded_db: Session):
    headers = {"x-admin-key": settings.admin_api_key}
    payload = {
        "airlineCode": "GA",
        "flightNumber": "GA 999",
        "originCode": "CGK",
        "destinationCode": "DPS",
        "departureAt": "2027-01-10T02:00:00Z",
        "arrivalAt": "2027-01-10T04:00:00Z",
        "durationMinutes": 120,
        "stops": 0,
        "cabinClass": "economy",
        "price": 199,
        "currency": "USD",
        "seatsAvailable": 30,
    }
    created = client.post("/api/admin/flights", headers=headers, json=payload)
    assert created.status_code == 201, created.text
    flight_id = created.json()["id"]

    updated = client.put(
        f"/api/admin/flights/{flight_id}", headers=headers, json={"seatsAvailable": 12}
    )
    assert updated.status_code == 200
    assert updated.json()["seatsAvailable"] == 12

    deleted = client.delete(f"/api/admin/flights/{flight_id}", headers=headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/flights/{flight_id}").status_code == 404
