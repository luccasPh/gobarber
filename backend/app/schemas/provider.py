import pytz
from datetime import datetime, timezone
from pydantic import BaseModel
from pydantic import UUID4, validator

from app.schemas.user import User

class ProviderDaysAvailability(BaseModel):
    day: int
    available: bool

class ProviderHoursAvailability(BaseModel):
    hour: int
    available: bool

class ProviderMonthAvailabilityQuery(BaseModel):
    provider_id: str
    month: int
    year: int

class ProviderDayAvailabilityQuery(BaseModel):
    provider_id: str
    day: int
    month: int
    year: int

class ProviderAppointmentsQuery(BaseModel):
    day: int
    month: int
    year: int

class ProviderAppointments(BaseModel):
    id: UUID4
    provider_id: UUID4
    date: datetime
    user: User

    @validator("date", pre=True)
    def format_date(cls, value: datetime):
        if value.tzname() == '-03':
            return value
            
        return value.replace(
            tzinfo=timezone.utc
        ).astimezone(tz=pytz.timezone("America/Sao_Paulo"))

    class Config:
        orm_mode = True