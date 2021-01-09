import jwt

from app.core.config import settings

def encode_payload(payload: dict) -> bytes:
    return jwt.encode(payload, settings.AUTH_SECRET_KEY, algorithm='HS256')

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.AUTH_SECRET_KEY, algorithm='HS256')
