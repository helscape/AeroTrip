from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import AirportOut
from ..services.flight_service import list_airports

router = APIRouter(prefix="/api/airports", tags=["airports"])


@router.get("", response_model=list[AirportOut])
def search_airports(
    q: Annotated[str | None, Query(max_length=100)] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 200,
    db: Session = Depends(get_db),
):
    return list_airports(db, q, limit)
