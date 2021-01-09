from app.core.security import verify_password
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserUpdate
from app.tests import utils
from app.crud import crud_user


def test_create_user(db: Session) -> None:
    name = utils.random_lower_string()
    surname = utils.random_lower_string()
    email = utils.random_email()
    password = utils.random_lower_string()
    user_in = UserCreate(
        name=name, 
        email=email,
        surname=surname, 
        password=password, 
        confirm_password=password
    )
    user = crud_user.create(db, user_in)
    assert user
    assert user.name == name
    assert user.surname == surname
    assert user.email == email
    assert verify_password(password, user.hashed_password)

    db.delete(user)
    db.commit()

def test_create_provider(db: Session) -> None:
    name = utils.random_lower_string()
    surname = utils.random_lower_string()
    address = utils.random_lower_string()
    email = utils.random_email()
    password = utils.random_lower_string()
    user_in = UserCreate(
        name=name,
        surname=surname,
        address=address, 
        email=email, 
        password=password, 
        confirm_password=password
    )
    user = crud_user.create(db, user_in)
    assert user
    assert user.name == name
    assert user.surname == surname
    assert user.address == address
    assert user.email == email
    assert verify_password(password, user.hashed_password)

    db.delete(user)
    db.commit()

def test_update(db: Session) -> None:
    user = utils.create_random_provider(db)
    name = utils.random_lower_string()
    surname = utils.random_lower_string()
    address = utils.random_lower_string()
    email = utils.random_email()
    avatar = utils.random_lower_string()
    is_active = True
    user_in = UserUpdate(
        name=name,
        surname=surname,
        address=address,
        email=email,
        avatar=avatar,
        is_active=is_active
    )
    db_user = crud_user.update(db, user, user_in)
    assert db_user.name == name
    assert db_user.surname == surname
    assert db_user.address == address
    assert db_user.email == email
    assert db_user.avatar == avatar
    assert db_user.is_active == is_active

    db.delete(user)
    db.commit()

def test_update_password(db: Session) -> None:
    user = utils.create_random_user(db)
    new_password = utils.random_lower_string()
    crud_user.update_password(db, user, new_password)
    assert verify_password(new_password, user.hashed_password)

    db.delete(user)
    db.commit()

def test_get_user_by_id(db: Session) -> None:
    user = utils.create_random_user(db)
    db_user = crud_user.get_user_by_id(db, str(user.id))
    assert db_user
    assert db_user.id == user.id
    assert db_user.name == user.name
    assert db_user.email == user.email

    db.delete(user)
    db.commit()

def test_get_user_by_email(db: Session) -> None:
    user = utils.create_random_user(db)
    db_user = crud_user.get_user_by_email(db, user.email)
    assert db_user
    assert db_user.id == user.id
    assert db_user.name == user.name
    assert db_user.email == user.email

    db.delete(user)
    db.commit()

def test_get_all_providers(db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    list_providers = crud_user.get_all_providers(db, user)
    assert list_providers
    assert list_providers[0].id != user.id
    assert list_providers[0].address
    assert list_providers[0].is_active

    db.delete(user)
    db.delete(provider)
    db.commit()