from datetime import datetime
from typing import List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate
from app.models.user import User
from app.schemas.provider import (
    ProviderMonthAvailabilityQuery, 
    ProviderDayAvailabilityQuery)

def create(db: Session, appointment_in: AppointmentCreate, user: User) -> Appointment:
    appointment_in_data = jsonable_encoder(appointment_in)
    db_appointment = Appointment(**appointment_in_data, user_id=user.id)

    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    return db_appointment

def get_appointments_by_user(db: Session, user: User) -> List[Appointment]:
    date_now = datetime.utcnow()
    return db.query(Appointment).filter(
        and_(
            Appointment.user_id == user.id,
            Appointment.date >= date_now
        )
    ).all()

def get_appointment_by_date(db: Session, provider_id: str ,date: datetime) -> Appointment:
    return db.query(Appointment).filter(
        and_(
            Appointment.provider_id==provider_id,
            Appointment.date==date
        )   
    ).first()

def get_appointments_by_MY(
    db: Session, 
    query: ProviderMonthAvailabilityQuery
) -> List[Appointment]:
    """
    MY - Month and Year
    """
    return db.query(Appointment).filter(
        and_(
            Appointment.provider_id == query.provider_id,
            extract("month", Appointment.date) == query.month,
            extract("year", Appointment.date) == query.year,
        )
    ).all()

def get_appointments_by_DMY(
    db: Session, 
    query: ProviderDayAvailabilityQuery, 
    user: User = False
) -> List[Appointment]:
    """
    DMY - Day and Month and Year\n
    if user was passed to query by user id
    """
    if user:
        provider_id = user.id
    else:
        provider_id = query.provider_id

    return db.query(Appointment).filter(
        and_(
            Appointment.provider_id == provider_id,
            extract("day", Appointment.date) == query.day,
            extract("month", Appointment.date) == query.month,
            extract("year", Appointment.date) == query.year,
        )
    ).all()