from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def transaction(db: Session):
    """Commit on success and roll back on error.

    A dependency may have already autobegun a transaction (for example when
    resolving a Bearer token), so calling ``db.begin()`` directly would fail.
    This works whether or not a transaction is active.
    """
    try:
        yield
        db.commit()
    except Exception:
        db.rollback()
        raise


def init_db() -> None:
    """Create all tables and apply small additive migrations.

    ``create_all`` never alters tables that already exist, so this applies the
    handful of additive changes introduced after the first release. Each step
    is idempotent — safe to run on every seed/startup.
    """
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    # Bookings gained an optional link to a user account.
    if "user_id" not in {c["name"] for c in inspector.get_columns("bookings")}:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE bookings ADD COLUMN user_id VARCHAR(40) NULL")
            )
            connection.execute(
                text("CREATE INDEX ix_bookings_user_id ON bookings (user_id)")
            )
            connection.execute(
                text(
                    "ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user "
                    "FOREIGN KEY (user_id) REFERENCES users (id)"
                )
            )

    # Users gained a role for admin access.
    if "role" not in {c["name"] for c in inspector.get_columns("users")}:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'user'")
            )
