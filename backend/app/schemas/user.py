import pytz
from typing import Optional, Union
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, UUID4, validator
from datetime import datetime, timezone

from app.utils import media

class UserBase(BaseModel):
    name: str
    surname: str
    address: Optional[str]
    email: str

class User(UserBase):
    id: UUID4
    address: Optional[str]
    avatar: Optional[str]

    @validator("avatar")
    def set_avatar_url(cls, v, values, **kwargs):
        if v:
            if v[0] != "h":
                return media.get_url(v)
            else:
                return v
        else:
            url = f"https://ui-avatars.com/api/?background=random&name=${values['name']}+${values['surname']}"
        
        return url

    class Config:
        orm_mode = True

class UserCreate(UserBase):
    password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise HTTPException(status_code=400, detail='Senha e confirmação de senha não confere!')
        return v
        
class UserUpdate(UserBase):
    avatar: Optional[str]
    is_active: Optional[bool]

    class Config:
        orm_mode = True

class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise HTTPException(status_code=400, detail='Senha e confirmação de senha não confere!')
        return v

class UserActive(BaseModel):
    token: str

class UserAppointments(BaseModel):
    id: UUID4
    user_id: UUID4
    provider: User
    date: datetime

    @validator("date", pre=True)
    def format_date(cls, value: datetime):
        if value.tzname() == '-03':
            return value
            
        return value.replace(
            tzinfo=timezone.utc
        ).astimezone(tz=pytz.timezone("America/Sao_Paulo"))

    class Config:
        orm_mode = True

class UserAppointmentsQuery(BaseModel):
    day: int
    month: int
    year: int