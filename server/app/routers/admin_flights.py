from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..schemas import AdminFlightCreate, AdminFlightUpdate, FlightOut
from ..services.flight_service import create_flight, delete_flight, flight_out, update_flight

router = APIRouter(
    prefix="/api/admin/flights",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


@router.post("", response_model=FlightOut, status_code=status.HTTP_201_CREATED)
def create(payload: AdminFlightCreate, db: Session = Depends(get_db)):
    return flight_out(create_flight(db, payload))


@router.put("/{flight_id}", response_model=FlightOut)
def update(flight_id: str, payload: AdminFlightUpdate, db: Session = Depends(get_db)):
    return flight_out(update_flight(db, flight_id, payload))


@router.delete("/{flight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(flight_id: str, db: Session = Depends(get_db)):
    delete_flight(db, flight_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
