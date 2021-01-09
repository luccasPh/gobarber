from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.schemas.appointment import AppointmentCreate
from app.crud import crud_appointment
from app.tests import utils
from app.schemas.provider import (
    ProviderMonthAvailabilityQuery, 
    ProviderDayAvailabilityQuery)


def test_create_appointment(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    date = datetime.now(timezone.utc)
    appointment_in = AppointmentCreate(provider_id=provider.id, date=date)
    appointment = crud_appointment.create(db, appointment_in, user)
    assert appointment
    assert appointment.provider_id == provider.id
    assert appointment.date == date
    assert appointment.user_id == user.id

    db.delete(appointment)
    db.delete(user)
    db.delete(provider)
    db.commit()

def test_get_appointments_by_user(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    user_appointments = crud_appointment.get_appointments_by_user(db, user)
    assert user_appointments[0].user_id == user.id

    db.delete(appointment)
    db.delete(user)
    db.delete(provider)
    db.commit()

def test_get_appointment_by_date(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    date = appointment.date
    date_appointment = crud_appointment.get_appointment_by_date(db, str(provider.id), date)
    assert date_appointment.provider_id == provider.id
    assert date_appointment.date == date

    db.delete(appointment)
    db.delete(user)
    db.delete(provider)
    db.commit()

def test_get_appointments_by_MY(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    date = appointment.date
    query = ProviderMonthAvailabilityQuery(
        provider_id=str(provider.id), 
        month=date.month, 
        year=date.year)
    my_appointment = crud_appointment.get_appointments_by_MY(db, query)
    assert str(my_appointment[0].provider_id) == query.provider_id
    assert my_appointment[0].date.month == query.month
    assert my_appointment[0].date.year == query.year

    db.delete(appointment)
    db.delete(user)
    db.delete(provider)
    db.commit()

def test_get_appointments_by_DMY(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    appointment = utils.create_random_appointment(db, provider, user)
    date = appointment.date
    query = ProviderDayAvailabilityQuery(
        provider_id=str(provider.id),
        day=date.day, 
        month=date.month, 
        year=date.year)
    my_appointment_1 = crud_appointment.get_appointments_by_DMY(db, query)
    my_appointment_2 = crud_appointment.get_appointments_by_DMY(db, query, provider)
    assert str(my_appointment_1[0].provider_id) == query.provider_id
    assert my_appointment_1[0].date.day == query.day
    assert my_appointment_1[0].date.month == query.month
    assert my_appointment_1[0].date.year == query.year
    assert my_appointment_2[0].provider_id == provider.id
    assert my_appointment_2[0].date.day == query.day
    assert my_appointment_2[0].date.month == query.month
    assert my_appointment_2[0].date.year == query.year

    db.delete(appointment)
    db.delete(user)
    db.delete(provider)
    db.commit()


