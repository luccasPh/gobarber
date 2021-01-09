from app.schemas.appointment import Appointment
import pickle
from redis import Redis
from typing import Any
from datetime import timedelta

from app.models.user import User as UserModel
from .config import settings
class RedisCache(Redis):
    def __init__(self):
        if(settings.REDIS_URL):
            temp = settings.REDIS_URL.split(':')
            port = temp[-1]
            temp = temp[2].split('@')
            password = temp[0]
            host = temp[1]
            super().__init__(
                host=host,
                port=port,
                password=password,
                username=""
            )
        else:
            super().__init__(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                username=settings.REDIS_USER
            )
    
    def set_to_cache(self, key: str, value: Any) -> None:
        self.setex(key, timedelta(seconds=3600), value=pickle.dumps(value))
    
    def get_from_cache(self, key: str) -> Any:
        data = self.get(key)
        if not data:
            return None

        return pickle.loads(data)
    
    def invalidate_cache(self, key: str) -> None:
        self.delete(key)
    
    def invalidate_cache_prefix(self, prefix: str) -> None:
        keys = self.keys(f"{prefix}:*")
        pipeline = self.pipeline()
        for key in keys:
            pipeline.delete(key)
        pipeline.execute()
    
    def invalidate_cache_provider(self, user: UserModel) -> None:
        """
        Delete the cache of a specific provider 
        through the relationship between user and appointment
        """
        appointment: Appointment
        for appointment in user.user_appointments:
            prefix = f"providers-appointments:{appointment.provider_id}"
            if self.keys(f"{prefix}:*"):
                self.invalidate_cache_prefix(prefix)

    def invalidate_cache_user(self, provider: UserModel) -> None:
        """
        Delete the cache of a specific user 
        through the relationship between user/provider and appointment
        """
        appointment: Appointment
        for appointment in provider.provider_appointments:
            prefix = f"user-appointments:{appointment.user_id}"
            self.delete(prefix)
