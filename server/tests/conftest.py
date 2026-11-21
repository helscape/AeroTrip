import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models  # noqa: F401  (registers tables on Base.metadata)
from app.config import settings
from app.database import Base, get_db
from app.main import app
from seed import seed_data

test_engine = create_engine(settings.test_database_url, pool_pre_ping=True)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    yield
    Base.metadata.drop_all(test_engine)


@pytest.fixture
def db():
    with TestSession() as session:
        yield session


@pytest.fixture
def seeded_db(db):
    seed_data(db, compact=True)
    return db


@pytest.fixture
def client():
    def override_get_db():
        with TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
