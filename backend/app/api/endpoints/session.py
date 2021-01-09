from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi import BackgroundTasks
from sqlalchemy.orm.session import Session
from datetime import datetime, timedelta

from app.schemas.session import SessionLogin, SessionReset, SessionUser, SessionForget
from app.api import deps
from app.core import security
from app.crud import crud_user
from app.utils import mail

router = APIRouter()

@router.post("/access-token",  response_model=SessionUser)
def login_access_token(
    data: SessionLogin, 
    db: Session = Depends(deps.get_db)) -> Any:
    """
    Endpoint for access token
    """
    user = crud_user.get_user_by_email(db, data.email)
    credentials_exception = HTTPException(status_code=400, detail="E-mail ou senha incorretos!")
    if not user:
        raise credentials_exception

    if not security.verify_password(data.password, user.hashed_password):
        raise credentials_exception

    if not user.is_active:
            raise HTTPException(status_code=401, detail="Este e-mail ainda não foi verificado. Verifique sua caixa de entrada")
    
    if not user.address and data.host == "web":
            raise HTTPException(status_code=401, detail="Versão web e apenas para cabeleireiros, porfavor user a versão mobile")
    
    session = {
        "user": jsonable_encoder(user),
        "token": security.generate_token(str(user.id), 'access', datetime.utcnow() + timedelta(days=1))
    }
    return session

@router.post("/forgot-password")
def request_forgot_password(
    data: SessionForget, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for recovery password
    """
    user = crud_user.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")

    token = security.generate_token(str(user.id), "reset", datetime.utcnow() + timedelta(hours=2))
    background_tasks.add_task(mail.send_reset_password_email, user.name, user.email, token)
    
    return {'detail': 'E-mail de recuperação enviado, por favor verifique sua caixa de entrada'}

@router.post("/reset-password")
def request_reset_password(
    data: SessionReset, 
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for reset password
    """
    user_id = security.verify_token(data.token, 'reset')
    user = crud_user.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")

    crud_user.update_password(db, user, data.new_password)
    
    return {'detail': 'Senha recuperada com sucesso'}