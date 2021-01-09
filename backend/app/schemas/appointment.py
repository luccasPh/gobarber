import pytz
from datetime import datetime, timezone
from pydantic import BaseModel, UUID4, validator

class AppointmentBase(BaseModel):
    provider_id: UUID4
    date: datetime

class Appointment(AppointmentBase):
    id: UUID4
    user_id: UUID4

    @validator("date", pre=True)
    def format_date(cls, value: datetime):
        return value.replace(
            tzinfo=timezone.utc
        ).astimezone(tz=pytz.timezone("America/Sao_Paulo"))

    class Config:
        orm_mode = True

class AppointmentCreate(AppointmentBase):
    ...