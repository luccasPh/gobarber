from typing import Any, List
from fastapi import APIRouter, Depends
from pydantic import parse_obj_as
from sqlalchemy.orm.session import Session
from calendar import monthrange
from datetime import datetime
from starlette.responses import Response
from starlette import status

from app.core.cache import RedisCache
from app.models.user import User as UserModel
from app.api import deps
from app.crud import crud_user, crud_appointment, crud_notification
from app.schemas.user import User
from app.schemas.notification import Notification, ReadNotification
from app.schemas.provider import (
    ProviderMonthAvailabilityQuery,
    ProviderDayAvailabilityQuery,
    ProviderDaysAvailability, 
    ProviderHoursAvailability,
    ProviderAppointmentsQuery,
    ProviderAppointments
)

router = APIRouter()

@router.get("", response_model=List[User])
def list_providers(
    user: UserModel = Depends(deps.get_user), 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis)
) -> Any:
    """
    Endpoint for list providers
    """
    cache_key = f"providers-list:{str(user.id)}"
    providers = rdc.get_from_cache(cache_key)
    if not providers:
        providers = crud_user.get_all_providers(db, user)
        rdc.set_to_cache(cache_key, providers)

    return providers

@router.get("/me", response_model=List[ProviderAppointments])
def list_self_provider_appointments(
    query: ProviderAppointmentsQuery = Depends(),
    user: UserModel = Depends(deps.get_user), 
    db: Session = Depends(deps.get_db),
    rdc: RedisCache = Depends(deps.get_redis),
) -> Any:
    """
    Endpoint for list self provider appointments
    """
    cache_key = f"providers-appointments:{str(user.id)}:{query.year}:{query.month}:{query.day}"
    appointments = rdc.get_from_cache(cache_key)
    if not appointments:
        appointments = crud_appointment.get_appointments_by_DMY(db, query, user)
        rdc.set_to_cache(cache_key, parse_obj_as(List[ProviderAppointments], appointments))

    return appointments

@router.get(
    "/month-availability", 
    dependencies=[Depends(deps.get_user)], 
    response_model=List[ProviderDaysAvailability]
)
def list_provider_days_availability(
    query: ProviderMonthAvailabilityQuery = Depends(),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for provider days available in month
    """
    appointments = crud_appointment.get_appointments_by_MY(db, query)
    month_days = monthrange(query.year, query.month)[1]
    days_array = [i for i in range(1, month_days + 1)]

    availability = []
    for day in days_array:
        appointment_in_day = []
        for appointment in appointments:
            if appointment.date.day == day:
                appointment_in_day.append(day)
        
        current_date = datetime.utcnow()
        compare_date = datetime(query.year, query.month, day, 23, 59, 59)

        availability.append({
            'day': day,
            'available': True if len(appointment_in_day) < 10 and current_date < compare_date else False
        })

    return availability

@router.get(
    "/day-availability", 
    dependencies=[Depends(deps.get_user)], 
    response_model=List[ProviderHoursAvailability]
)
def list_provider_hours_availability(
    query: ProviderDayAvailabilityQuery = Depends(),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Endpoint for provider times available on the day
    """
    appointments = crud_appointment.get_appointments_by_DMY(db, query)
    hours_array = [i for i in range(8, 18)]
 
    availability = []
    for hour in hours_array:
        appointment_in_hour_available = True
        for appointment in appointments:
            if appointment.date.hour - 3 == hour:
                appointment_in_hour_available = False
                break
        
        current_date = datetime.utcnow()
        compare_date = datetime(query.year, query.month, query.day, hour + 3)

        availability.append({
            'hour': hour,
            'available': ( 
                appointment_in_hour_available if (
                   ( current_date < compare_date) and 
                   (compare_date.weekday() < 5)
                ) 
                else False
            )
        })

    return availability

@router.get("/notifications", response_model=List[Notification])
def list_provider_notifications(
    user: UserModel = Depends(deps.get_user),
) -> Any:
    """
    Endpoint for list provider notifications
    """
    notifications = crud_notification.get_all_notifications(str(user.id))
    return notifications

@router.put("/notifications",  responses={204: {"model": None}})
def update_notification(
    data: ReadNotification,
    user: UserModel = Depends(deps.get_user),
) -> Any:
    """
    Endpoint for update notification
    """
    crud_notification.update(data.doc_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)