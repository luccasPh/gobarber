import random
import string
from sqlalchemy.orm.session import Session
from datetime import datetime, timezone

from app.models.notification import Notification
from app.models.user import User
from app.schemas.appointment import Appointment, AppointmentCreate
from app.schemas.user import UserCreate, UserUpdate
from app.crud import crud_user, crud_notification, crud_appointment


def create_random_user(db: Session, password: str = None) -> User:
    name = random_lower_string()
    surname = random_lower_string()
    email = random_email()
    if not password:
        password = random_lower_string()
    user_in = UserCreate(
        name=name,
        surname=surname, 
        email=email, 
        password=password, 
        confirm_password=password
    )
    return crud_user.create(db, user_in)

def create_random_provider(db: Session, password: str = None) -> User:
    name = random_lower_string()
    surname = random_lower_string()
    address = random_lower_string()
    email = random_email()
    if not password:
        password = random_lower_string()
    user_in = UserCreate(
        name=name,
        surname=surname,
        address=address, 
        email=email, 
        password=password, 
        confirm_password=password
    )
    return crud_user.create(db, user_in)

def activate_random_user(db: Session, user: User) -> User:
    user_in = UserUpdate(
        name=user.name,
        surname=user.surname,
        email=user.email,
        is_active=True,
    )
    if user.address:
        user_in.address = user.address
    return crud_user.update(db, user, user_in)
    
def create_random_appointment(
    db: Session, 
    provider: User, 
    user: User
) -> Appointment:
    date = datetime.now(timezone.utc)
    date = date.replace(day=date.day+1)
    appointment_in = AppointmentCreate(provider_id=provider.id, date=date)
    return crud_appointment.create(db, appointment_in, user)


def create_random_notification(provider: User) -> Notification:
    message = random_lower_string()
    document_id = crud_notification.create(str(provider.id), message)
    return Notification.objects(id=document_id).first()

def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    value_1 = "".join(random.choices(string.ascii_lowercase, k=10))
    value_2 = "".join(random.choices(string.ascii_lowercase, k=10))

    return f"{value_1}@{value_2}.com"