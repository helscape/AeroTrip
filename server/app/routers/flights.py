from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import FlightOut, SearchParams, SearchResponse
from ..services.flight_service import flight_out, get_flight, list_flights, search_flights

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("/search", response_model=SearchResponse)
def search(
    params: Annotated[SearchParams, Query()],
    db: Session = Depends(get_db),
):
    return search_flights(db, params)


@router.get("", response_model=list[FlightOut])
def list_all(limit: Annotated[int, Query(ge=1, le=500)] = 100, db: Session = Depends(get_db)):
    return [flight_out(f) for f in list_flights(db, limit)]


@router.get("/{flight_id}", response_model=FlightOut)
def detail(flight_id: str, db: Session = Depends(get_db)):
    return flight_out(get_flight(db, flight_id))
