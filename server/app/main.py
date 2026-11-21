from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .errors import install_error_handlers
from .routers import admin_flights, airports, auth, bookings, flights

app = FastAPI(
    title="AeroTrip API",
    version="0.1.0",
    description="Flight search and booking API for AeroTrip.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

install_error_handlers(app)

app.include_router(airports.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(bookings.me_router)
app.include_router(auth.router)
app.include_router(admin_flights.router)


@app.get("/api/health", tags=["meta"])
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}
