from app.crud import crud_user
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm.session import Session
from starlette.background import BackgroundTasks
from datetime import datetime

from app.api import deps
from app.utils import date
from app.crud import crud_appointment, crud_notification
from app.schemas.appointment import AppointmentCreate, Appointment
from app.models.user import User
from app.core.cache import RedisCache

router = APIRouter()

@router.post("", response_model=Appointment, status_code=201)
def create_appointments(
    data: AppointmentCreate,
    background_tasks: BackgroundTasks, 
    user: User = Depends(deps.get_user),
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis)
) -> Any:
    """
    Endpoint for create appointment
    """
    db_provider = crud_user.get_user_by_id(db, str(data.provider_id))
    if not db_provider:
        raise HTTPException(
            status_code=404, 
            detail="Cabeleireiro não encontrado"
        )

    current_date = datetime.now()
    compare_date = data.date.replace(tzinfo=None)
    if compare_date < current_date:
        raise HTTPException(
            status_code=400, 
            detail="Você não pode marcar agendamento em datas passadas"
        )
    
    if data.date.hour < 8 or data.date.hour > 17:
        raise HTTPException(
            status_code=400, 
            detail="Você só pode cria agendamentos entre 8:00 e 17:00"
        )

    if data.provider_id == user.id:
        raise HTTPException(
            status_code=400, 
            detail="Você não pode marca agendamento consigo mesmo"
        )

    validate_date = crud_appointment.get_appointment_by_date(db, data.provider_id, data.date)
    if validate_date:
        raise HTTPException(status_code=400, detail="Este horario já esta agendado")

    appointment = crud_appointment.create(db, data, user)
    msg = f"Novo agendamento de {user.name} {user.surname} para o {date.format_date(data.date)}"
    background_tasks.add_task(crud_notification.create, str(data.provider_id), msg)
    date_time = data.date
    rdc.invalidate_cache(
        f"providers-appointments:{data.provider_id}:{date_time.year}:{date_time.month}:{date_time.day}"
    )
    rdc.invalidate_cache(f"user-appointments:{user.id}")

    return appointment

