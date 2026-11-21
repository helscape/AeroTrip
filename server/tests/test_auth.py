from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import models as m

REGISTER = {
    "email": "traveler@example.com",
    "password": "supersecret1",
    "fullName": "Ayu Traveler",
    "phone": "+62 812 3456 7890",
}

USER_KEYS = {"id", "email", "fullName", "phone", "role", "createdAt"}
SUMMARY_KEYS = {
    "id",
    "reference",
    "status",
    "tripType",
    "contactEmail",
    "total",
    "currency",
    "createdAt",
}


def register(client: TestClient, **overrides):
    return client.post("/api/auth/register", json={**REGISTER, **overrides})


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def first_flight(client: TestClient):
    params = {
        "origin": "CGK",
        "destination": "DPS",
        "departDate": (date.today() + timedelta(days=14)).isoformat(),
    }
    return client.get("/api/flights/search", params=params).json()["outbound"][0]


def booking_payload(flight: dict, email: str = "traveler@example.com") -> dict:
    return {
        "tripType": "one-way",
        "outboundFlightId": flight["id"],
        "cabinClass": flight["cabinClass"],
        "contactEmail": email,
        "contactPhone": "+62 812 0000 0000",
        "passengers": [
            {
                "fullName": "Traveler One",
                "dateOfBirth": "1995-05-14",
                "passportNumber": "A1234567",
            }
        ],
    }


def test_register_returns_token_and_user(client: TestClient):
    response = register(client)
    assert response.status_code == 201, response.text
    body = response.json()
    assert set(body) == {"token", "user"}
    assert isinstance(body["token"], str) and body["token"]

    user = body["user"]
    assert set(user) == USER_KEYS
    assert user["id"].startswith("usr_")
    assert user["email"] == REGISTER["email"]
    assert user["fullName"] == REGISTER["fullName"]
    assert user["phone"] == REGISTER["phone"]
    assert user["createdAt"].endswith("Z")

    me = client.get("/api/auth/me", headers=auth_headers(body["token"]))
    assert me.status_code == 200, me.text
    assert me.json() == user


def test_duplicate_email_returns_conflict(client: TestClient):
    assert register(client).status_code == 201
    response = register(client, email="TRAVELER@example.com", fullName="Someone Else")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CONFLICT"
    assert response.json()["error"]["message"] == "Email already registered"


def test_register_validation(client: TestClient):
    assert register(client, password="short").status_code == 422
    assert register(client, fullName="A").status_code == 422
    assert register(client, email="not-an-email").status_code == 422


def test_login_success_and_failures(client: TestClient):
    created = register(client).json()
    response = client.post(
        "/api/auth/login",
        json={"email": "TRAVELER@example.com", "password": REGISTER["password"]},
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"] == created["user"]
    assert isinstance(response.json()["token"], str) and response.json()["token"]

    wrong = client.post(
        "/api/auth/login", json={"email": REGISTER["email"], "password": "wrongpass"}
    )
    assert wrong.status_code == 401
    assert wrong.json()["error"]["code"] == "UNAUTHORIZED"

    unknown = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": REGISTER["password"]}
    )
    assert unknown.status_code == 401


def test_long_password_is_supported(client: TestClient):
    password = "a" * 200
    assert register(client, password=password).status_code == 201
    response = client.post(
        "/api/auth/login", json={"email": REGISTER["email"], "password": password}
    )
    assert response.status_code == 200, response.text


def test_me_requires_valid_bearer_token(client: TestClient):
    register(client)
    for headers in (
        {},
        {"Authorization": "Bearer garbage"},
        {"Authorization": "Basic abc"},
        {"Authorization": "Bearer"},
    ):
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401, headers
        assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_patch_me(client: TestClient):
    created = register(client).json()
    headers = auth_headers(created["token"])

    response = client.patch("/api/auth/me", headers=headers, json={"fullName": "Ayu Renamed"})
    assert response.status_code == 200, response.text
    assert response.json()["fullName"] == "Ayu Renamed"
    assert response.json()["email"] == created["user"]["email"]

    response = client.patch("/api/auth/me", headers=headers, json={"phone": "+1 555 0000"})
    assert response.status_code == 200
    assert response.json()["phone"] == "+1 555 0000"

    response = client.patch(
        "/api/auth/me", headers=headers, json={"fullName": "Another Name", "phone": None}
    )
    assert response.status_code == 200
    assert response.json()["fullName"] == "Another Name"
    assert response.json()["phone"] is None
    assert client.get("/api/auth/me", headers=headers).json() == response.json()


def test_authenticated_owner_manages_bookings_without_email_or_reference(
    client: TestClient, seeded_db: Session
):
    user = register(client).json()
    headers = auth_headers(user["token"])
    flight = first_flight(client)

    created = client.post("/api/bookings", headers=headers, json=booking_payload(flight))
    assert created.status_code == 201, created.text
    booking = created.json()
    assert seeded_db.get(m.Booking, booking["id"]).user_id == user["user"]["id"]

    mine = client.get("/api/me/bookings", headers=headers)
    assert mine.status_code == 200, mine.text
    assert len(mine.json()) == 1
    assert set(mine.json()[0]) == SUMMARY_KEYS
    assert mine.json()[0]["reference"] == booking["reference"]

    updated = client.patch(
        f"/api/bookings/{booking['id']}",
        headers=headers,
        json={"contactEmail": "new@example.com", "contactPhone": "+1 555 0100"},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["contactEmail"] == "new@example.com"

    cancelled = client.delete(f"/api/bookings/{booking['id']}", headers=headers)
    assert cancelled.status_code == 204, cancelled.text
    lookup = client.get(
        f"/api/bookings/{booking['reference']}", params={"email": "new@example.com"}
    )
    assert lookup.json()["status"] == "cancelled"
    assert client.get("/api/me/bookings", headers=headers).json()[0]["status"] == "cancelled"


def test_me_bookings_scoped_to_user_and_requires_auth(client: TestClient, seeded_db: Session):
    alice = register(client, email="alice@example.com", fullName="Alice User").json()
    bob = register(client, email="bob@example.com", fullName="Bob User").json()
    flight = first_flight(client)

    alice_headers = auth_headers(alice["token"])
    bob_headers = auth_headers(bob["token"])
    alice_booking = client.post(
        "/api/bookings", headers=alice_headers, json=booking_payload(flight, "alice@example.com")
    ).json()
    client.post(
        "/api/bookings", headers=bob_headers, json=booking_payload(flight, "bob@example.com")
    )

    assert len(client.get("/api/me/bookings", headers=alice_headers).json()) == 1
    assert client.get("/api/me/bookings").status_code == 401

    forbidden = client.patch(
        f"/api/bookings/{alice_booking['id']}",
        headers=bob_headers,
        json={"contactEmail": "hijack@example.com", "contactPhone": None},
    )
    assert forbidden.status_code == 401
    assert forbidden.json()["error"]["code"] == "UNAUTHORIZED"


def test_guest_booking_flow_still_works(client: TestClient, seeded_db: Session):
    flight = first_flight(client)
    created = client.post("/api/bookings", json=booking_payload(flight, "guest@example.com"))
    assert created.status_code == 201, created.text
    booking = created.json()
    assert seeded_db.get(m.Booking, booking["id"]).user_id is None

    listed = client.get("/api/bookings", params={"email": "guest@example.com"})
    assert [b["reference"] for b in listed.json()] == [booking["reference"]]

    updated = client.patch(
        f"/api/bookings/{booking['id']}",
        params={"email": "guest@example.com", "reference": booking["reference"]},
        json={"contactEmail": "guest2@example.com", "contactPhone": "+1 555 1111"},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["contactEmail"] == "guest2@example.com"

    cancelled = client.delete(
        f"/api/bookings/{booking['id']}",
        params={"email": "guest2@example.com", "reference": booking["reference"]},
    )
    assert cancelled.status_code == 204, cancelled.text


def test_demo_account_can_log_in(client: TestClient, seeded_db: Session):
    response = client.post(
        "/api/auth/login", json={"email": "demo@aerotrip.test", "password": "demo1234"}
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"]["email"] == "demo@aerotrip.test"


def test_seeded_admin_and_tourist_accounts(client: TestClient, seeded_db: Session):
    admin = client.post(
        "/api/auth/login", json={"email": "admin@aerotrip.test", "password": "admin"}
    )
    tourist = client.post(
        "/api/auth/login", json={"email": "tourist@aerotrip.test", "password": "tourist"}
    )
    assert admin.status_code == 200, admin.text
    assert tourist.status_code == 200, tourist.text
    assert admin.json()["user"]["role"] == "admin"
    assert tourist.json()["user"]["role"] == "user"

    # The admin user can manage inventory with just a Bearer token.
    created = client.post(
        "/api/admin/flights",
        headers=auth_headers(admin.json()["token"]),
        json={
            "airlineCode": "GA",
            "flightNumber": "GA 777",
            "originCode": "CGK",
            "destinationCode": "DPS",
            "departureAt": "2027-01-10T02:00:00Z",
            "arrivalAt": "2027-01-10T04:00:00Z",
            "durationMinutes": 120,
            "cabinClass": "economy",
            "price": 199,
            "seatsAvailable": 30,
        },
    )
    assert created.status_code == 201, created.text

    forbidden = client.post("/api/admin/flights", headers=auth_headers(tourist.json()["token"]), json={})
    assert forbidden.status_code == 401
