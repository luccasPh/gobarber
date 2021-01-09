from enum import Enum
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, validator

from app.schemas.user import User

class Host(str, Enum):
    web = 'web'
    mobile = 'mobile'

class SessionLogin(BaseModel):
    email: str
    password: str
    host: Host

class SessionUser(BaseModel):
    user: User
    token: str

class SessionForget(BaseModel):
    email: str

class SessionReset(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise HTTPException(status_code=400, detail='Nova senha e confirmação de senha não confere!')
        return v
