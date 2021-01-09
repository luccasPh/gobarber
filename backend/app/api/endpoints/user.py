from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.encoders import jsonable_encoder
from pydantic.tools import parse_obj_as
from sqlalchemy.orm.session import Session
from starlette.background import BackgroundTasks
from starlette.responses import Response
from starlette import status

from app.core.cache import RedisCache
from app.models.user import User as UserModel
from app.api import deps
from app.crud import crud_user, crud_appointment
from app.utils import media, mail
from app.core import security
from app.schemas.user import (
    User, 
    UserCreate, 
    UserUpdate, 
    UserUpdatePassword, 
    UserActive,
    UserAppointments,
)

router = APIRouter()

@router.post("", status_code=201)
def create_user(
    data: UserCreate,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis)
) -> Any:
    """
    Endpoint for create user
    """
    user = crud_user.get_user_by_email(db, data.email)
    if user:
        raise HTTPException(status_code=400, detail='Endereço de email já registrador!')
    
    user = crud_user.create(db, data)
    rdc.invalidate_cache_prefix("providers-list")
    token = security.generate_token(str(user.id), "activate", datetime.utcnow() + timedelta(days=31))
    background_tasks.add_task(mail.send_account_activation_email, user.name, user.email, token)
    
    return {
        'detail': 'Enviamos um e-mail para você confirma seu cadastro, por favor verifique sua caixa de entrada.'
    }

@router.put("", response_model=User)
def update_user(
    data: UserUpdate, 
    user: UserModel = Depends(deps.get_user), 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis)
) -> Any:
    """
    Endpoint for update current user
    """
    db_user = crud_user.get_user_by_email(db, data.email)
    if db_user and db_user.id != user.id:
        raise HTTPException(status_code=400, detail='Endereço de email já registrador!')
    
    data.avatar = user.avatar
    data.is_active = user.is_active
    if not data.address and user.address:
        data.address = user.address

    user = crud_user.update(db, user, data)
    rdc.invalidate_cache_provider(user)
    if user.address:#<-- if have an address, is a provider
        rdc.invalidate_cache_user(user)
        rdc.invalidate_cache_prefix("providers-list")

    return user

@router.put("/file", response_model=User)
async def upload_avatar(
    user: UserModel = Depends(deps.get_user),
    file: UploadFile = File(...), 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis)
) -> Any:
    """
    Endpoint for upload user avatar
    """
    fileRead = await file.read()
    if user.avatar:
        avatar = media.update(fileRead, user.avatar)

    else:
        avatar = media.save(fileRead)

    user_in = UserUpdate(**jsonable_encoder(user))
    user_in.avatar = avatar
    user = crud_user.update(db, user, user_in)
    rdc.invalidate_cache_provider(user)
    if user.address:#<-- if have an address, is a provider
        rdc.invalidate_cache_prefix("providers-list")
        rdc.invalidate_cache_user(user)

    return user

@router.put("/password", responses={204: {"model": None}})
def update_user_password(
    data: UserUpdatePassword,
    user: UserModel = Depends(deps.get_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for update user password
    """
    if not security.verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail='A senha atual esta incorreta')
    
    crud_user.update_password(db, user, data.new_password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put("/activate")
def request_user_activate(
    data: UserActive, 
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for user activate
    """
    user_id = security.verify_token(data.token, 'activate')
    user = crud_user.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado!")

    if user.is_active:
        raise HTTPException(status_code=400,  detail="Conta já verificada")

    user_in = UserUpdate(**jsonable_encoder(user))
    user_in.is_active = True
    crud_user.update(db, user, user_in)
    if user.address:
        return {"type": "provider"}
    
    return {"type": "user"}


@router.get("/me", response_model=List[UserAppointments])
def list_self_provider_appointments(
    user: UserModel = Depends(deps.get_user), 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis),
) -> Any:
    """
    Endpoint for list self user appointments
    """
    cache_key = f"user-appointments:{str(user.id)}"
    appointments = rdc.get_from_cache(cache_key)
    if not appointments:
        appointments = crud_appointment.get_appointments_by_user(db, user)
        rdc.set_to_cache(cache_key, parse_obj_as(List[UserAppointments], appointments))

    return appointments