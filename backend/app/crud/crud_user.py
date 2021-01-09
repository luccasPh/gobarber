from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi.encoders import jsonable_encoder

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import create_password_hash

def create(db: Session, user_in: UserCreate) -> User:
    hashed_password = create_password_hash(user_in.password)
    del user_in.password
    del user_in.confirm_password
    user_in_data = jsonable_encoder(user_in)
    db_user = User(**user_in_data, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def update(db: Session, db_user: User, user_in: UserUpdate) -> User:
    db.query(User).filter_by(id=db_user.id).update(user_in)
    db.commit()
    db.refresh(db_user)

    return db_user

def update_password(db: Session, db_user: User, password: str) -> None:
    db.query(User).filter_by(id=db_user.id).update({
        'hashed_password': create_password_hash(password)
    })
    db.commit()
    db.refresh(db_user)
    
def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter_by(email = email).first()

def get_user_by_id(db: Session, user_id: str) -> User:
    return db.query(User).filter_by(id = user_id).first()

def get_all_providers(db: Session, user: User) -> List[User]:
    return db.query(User).filter(
        and_(
            User.id != user.id,
            User.address != None,
            User.is_active == True
        )
    ).all()