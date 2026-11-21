from datetime import date, datetime
from typing import Literal

import email_validator
from pydantic import BaseModel, EmailStr, Field, model_validator

# Pydantic's EmailStr calls email_validator without `test_environment`, which
# rejects reserved domains such as `.test`. Allow them so the seeded demo
# account (demo@aerotrip.test) can log in; all other validation is unchanged.
_original_validate_email = email_validator.validate_email


def _validate_email_allow_test_domains(*args, **kwargs):
    kwargs.setdefault("test_environment", True)
    return _original_validate_email(*args, **kwargs)


email_validator.validate_email = _validate_email_allow_test_domains

CabinClass = Literal["economy", "premium", "business", "first"]
TripType = Literal["one-way", "round-trip"]


def iso_z(value: datetime) -> str:
    """Serialize a naive UTC datetime as an ISO-8601 string with a Z suffix."""
    return value.isoformat(timespec="milliseconds") + "Z"


def iso_date(value: date) -> str:
    return value.isoformat()


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    fullName: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=40)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=40)


class UserOut(BaseModel):
    id: str
    email: str
    fullName: str
    phone: str | None = None
    role: str = "user"
    createdAt: str


class TokenOut(BaseModel):
    token: str
    user: UserOut


class AirportOut(BaseModel):
    code: str
    city: str
    country: str
    name: str


class AirlineOut(BaseModel):
    code: str
    name: str


class FlightOut(BaseModel):
    id: str
    airline: AirlineOut
    flightNumber: str
    from_: AirportOut = Field(alias="from")
    to: AirportOut
    departureAt: str
    arrivalAt: str
    durationMinutes: int
    stops: int
    cabinClass: str
    price: float
    currency: str
    seatsAvailable: int


class SearchResponse(BaseModel):
    outbound: list[FlightOut]
    return_: list[FlightOut] | None = Field(default=None, alias="return")


class PassengerOut(BaseModel):
    id: str
    fullName: str
    dateOfBirth: str
    passportNumber: str | None = None
    seatNo: str | None = None


class BookingOut(BaseModel):
    id: str
    reference: str
    status: str
    tripType: str
    outboundFlight: FlightOut
    returnFlight: FlightOut | None = None
    passengers: list[PassengerOut]
    contactEmail: str
    contactPhone: str | None = None
    total: float
    currency: str
    createdAt: str


class BookingListItem(BaseModel):
    id: str
    reference: str
    status: str
    tripType: str
    contactEmail: str
    total: float
    currency: str
    createdAt: str


class PassengerIn(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    dateOfBirth: date
    passportNumber: str | None = Field(default=None, max_length=40)


class BookingCreate(BaseModel):
    tripType: TripType
    outboundFlightId: str
    returnFlightId: str | None = None
    cabinClass: CabinClass
    contactEmail: EmailStr
    contactPhone: str | None = Field(default=None, max_length=40)
    passengers: list[PassengerIn] = Field(min_length=1, max_length=9)

    @model_validator(mode="after")
    def validate_legs(self) -> "BookingCreate":
        if self.tripType == "round-trip" and not self.returnFlightId:
            raise ValueError("returnFlightId is required for a round-trip booking")
        if self.tripType == "one-way" and self.returnFlightId:
            raise ValueError("returnFlightId must be omitted for a one-way booking")
        return self


class BookingUpdate(BaseModel):
    contactEmail: EmailStr
    contactPhone: str | None = Field(default=None, max_length=40)


class SearchParams(BaseModel):
    origin: str = Field(pattern=r"^[A-Za-z]{3}$")
    destination: str = Field(pattern=r"^[A-Za-z]{3}$")
    departDate: date
    returnDate: date | None = None
    passengers: int = Field(default=1, ge=1, le=9)
    cabin: CabinClass = "economy"
    maxStops: int | None = Field(default=None, ge=0, le=5)
    airline: str | None = Field(default=None, max_length=10)
    maxPrice: float | None = Field(default=None, gt=0)
    sort: Literal["price", "duration", "departure"] = "price"

    @model_validator(mode="after")
    def validate_route_and_dates(self) -> "SearchParams":
        if self.origin.upper() == self.destination.upper():
            raise ValueError("origin and destination must be different")
        if self.returnDate and self.returnDate < self.departDate:
            raise ValueError("returnDate must be on or after departDate")
        return self


class AdminFlightBase(BaseModel):
    airlineCode: str = Field(min_length=2, max_length=10)
    flightNumber: str = Field(min_length=2, max_length=20)
    originCode: str = Field(pattern=r"^[A-Za-z]{3}$")
    destinationCode: str = Field(pattern=r"^[A-Za-z]{3}$")
    departureAt: datetime
    arrivalAt: datetime
    durationMinutes: int = Field(gt=0)
    stops: int = Field(default=0, ge=0, le=5)
    cabinClass: CabinClass = "economy"
    price: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    seatsAvailable: int = Field(ge=0)
    status: str = Field(default="scheduled", max_length=20)

    @model_validator(mode="after")
    def validate_route_and_times(self) -> "AdminFlightBase":
        if self.originCode.upper() == self.destinationCode.upper():
            raise ValueError("originCode and destinationCode must be different")
        if self.arrivalAt <= self.departureAt:
            raise ValueError("arrivalAt must be after departureAt")
        return self


class AdminFlightCreate(AdminFlightBase):
    pass


class AdminFlightUpdate(BaseModel):
    airlineCode: str | None = Field(default=None, min_length=2, max_length=10)
    flightNumber: str | None = Field(default=None, min_length=2, max_length=20)
    originCode: str | None = Field(default=None, pattern=r"^[A-Za-z]{3}$")
    destinationCode: str | None = Field(default=None, pattern=r"^[A-Za-z]{3}$")
    departureAt: datetime | None = None
    arrivalAt: datetime | None = None
    durationMinutes: int | None = Field(default=None, gt=0)
    stops: int | None = Field(default=None, ge=0, le=5)
    cabinClass: CabinClass | None = None
    price: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    seatsAvailable: int | None = Field(default=None, ge=0)
    status: str | None = Field(default=None, max_length=20)
