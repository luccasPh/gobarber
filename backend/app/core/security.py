from fastapi.exceptions import HTTPException
from datetime import datetime
from passlib.context import CryptContext

from app.utils import token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_token(user_id: str, iss: str, exp: datetime) -> str:
    payload = {
        "sub": user_id,
        "iss": iss,
        "exp": exp
    }
    encoded_token = token.encode_payload(payload)

    return encoded_token.decode("utf-8")

def verify_token(str_token: str, iss: str) -> str:
    try:
        decoded_token = token.decode_token(str_token)
        if decoded_token['iss'] != iss:
            raise False
        return decoded_token['sub']

    except:
        raise HTTPException(status_code=401, detail="Token inválido")