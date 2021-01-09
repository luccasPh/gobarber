from app.core.cache import RedisCache
import pytest
from typing import Generator
from starlette.testclient import TestClient
from app.db.session import SessionLocal

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def db() -> Generator:
    yield SessionLocal()

@pytest.fixture(scope="session")
def rdc() -> Generator:
    """
    Get redis database
    """
    yield RedisCache()
