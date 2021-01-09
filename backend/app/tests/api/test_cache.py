from app.models.user import User
import pickle
from datetime import timedelta
from sqlalchemy.orm import Session

from app.core.cache import RedisCache
from app.tests import utils

def test_set_to_cache(rdc: RedisCache) -> None:
    key = "teste:1"
    value = 10
    rdc.set_to_cache(key, value)
    cache = pickle.loads(rdc.get(key))
    assert cache
    assert cache == 10

    rdc.delete(key)

def test_get_from_cache(rdc: RedisCache) -> None:
    key = "teste:2"
    value = 20
    rdc.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    cache = rdc.get_from_cache(key)
    assert cache
    assert cache == value

    rdc.delete(key)

def test_get_from_cache_none(rdc: RedisCache) -> None:
    key = "teste:3"
    cache = rdc.get_from_cache(key)
    assert cache is None

    rdc.delete(key)

def test_invalidate_cache(rdc: RedisCache) -> None:
    key = "teste:4"
    value = 20
    rdc.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    cache = rdc.get(key)
    assert cache
    rdc.invalidate_cache(key)
    cache = rdc.get(key)
    assert cache is None

    rdc.delete(key)

def test_invalidate_cache_prefix(rdc: RedisCache) -> None:
    suffix = utils.random_lower_string()
    prefix = "teste:5"
    key = f"{prefix}:{suffix}"
    value = 30
    rdc.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    cache = rdc.get(key)
    assert cache
    rdc.invalidate_cache_prefix(prefix)
    cache = rdc.get(key)
    assert cache is None

def test_invalidate_cache_provider(db: Session, rdc: RedisCache) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    user.user_appointments.append(appointment)
    prefix = f"providers-appointments:{str(provider.id)}"
    suffix = utils.random_lower_string()
    key = f"{prefix}:{suffix}"
    value = 40
    rdc.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    cache = rdc.get(key)
    assert cache
    rdc.invalidate_cache_provider(user)
    cache = rdc.get(key)
    assert cache is None

def test_invalidate_cache_user(db: Session, rdc: RedisCache) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    provider.provider_appointments.append(appointment)
    key = f"user-appointments:{str(user.id)}"
    value = 40
    rdc.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    cache = rdc.get(key)
    assert cache
    rdc.invalidate_cache_user(provider)
    cache = rdc.get(key)
    assert cache is None