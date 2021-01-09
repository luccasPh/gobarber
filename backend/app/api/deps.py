from typing import Generator
from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm.session import Session

from app.core.cache import RedisCache
from app.db.session import SessionLocal
from app.crud import crud_user
from app.models.user import User
from app.utils import token

def get_db() -> Generator:
    """
    Get database
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_redis() -> Generator:
    """
    Get redis database
    """
    try:
        rdc = RedisCache()
        yield rdc
    finally:
        pass        

def get_user(Authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    try:
        token_type, auth_token = Authorization.split(" ")
        if not auth_token or token_type.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Account token is missing")

        decoded_token = token.decode_token(auth_token)
        if decoded_token['iss'] != "access":
            raise False

        user =  crud_user.get_user_by_id(db, decoded_token['sub'])
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        return user

    except:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
