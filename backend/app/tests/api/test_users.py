import json
from uuid import uuid4
from pathlib import Path
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.tests import utils
from app.core import security
from app.core.config import settings

def test_create_users(client: TestClient, db: Session) -> None:
    name = utils.random_lower_string()
    surname = utils.random_lower_string()
    email =  utils.random_lower_string()
    password =  utils.random_lower_string()
    user_2 = utils.create_random_user(db)
    response_1 = client.post('/users', json={
        "name": name,
        "surname": surname,
        "email": user_2.email,
        "password": password,
        "confirm_password": password
    })
    response_2 = client.post('/users', json={
        "name": name,
        "surname": surname,
        "email": email,
        "password": password,
        "confirm_password": password
    })
    assert response_1.status_code == 400
    assert response_2.status_code == 201
   
    
def test_update_users(client: TestClient, db: Session) -> None:
    name = utils.random_lower_string()
    surname = utils.random_lower_string()
    address = utils.random_lower_string()
    user_1 = utils.create_random_user(db)
    user_2 = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    token_1 = security.generate_token(str(user_1.id), 'access', datetime.utcnow() + timedelta(days=1))
    token_2 = security.generate_token(str(provider.id), 'access', datetime.utcnow() + timedelta(days=1))
    header_1 = {'Authorization': f'Bearer {token_1}'}
    header_2 = {'Authorization': f'Bearer {token_2}'}
    # Update user with existing email
    response_1 = client.put('/users', headers=header_1, json={
        "name": name,
        "surname": surname,
        "email": user_2.email,
    })
    # Update user normally
    response_2 = client.put('/users', headers=header_1, json={
        "name": name,
        "surname": surname,
        "email": user_1.email,
    })
    # Update provider normally
    response_3 = client.put('/users', headers=header_2, json={
        "name": name,
        "surname": surname,
        "address": address,
        "email": provider.email,
    })
    assert response_1.status_code == 400
    data_1 = response_2.json()
    assert response_2.status_code == 200
    assert data_1
    assert data_1['name'] == name
    assert data_1['surname'] == surname
    data_2 = response_3.json()
    assert response_3.status_code == 200
    assert data_2
    assert data_2['name'] == name
    assert data_2['surname'] == surname
    assert data_2['address'] == address

    db.delete(provider)
    db.commit()
   

def test_upload_avatar(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    token = security.generate_token(str(user.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    file = settings.BASE_DIR.joinpath('app', 'tests', 'teste.jpg')
    with open(file, "rb") as f:
        response = client.put(
            "/users/file", 
            headers=header,
            files={"file": ("teste.jpg", f, "image/jpg")
        })
    
    data = response.json()
    assert response.status_code == 200
    assert "avatar" in data
    assert data["avatar"]

    db.delete(user)
    db.commit()
   

def test_update_password(client: TestClient, db: Session) -> None:
    old_password = utils.random_lower_string()
    new_password = utils.random_lower_string()
    user = utils.create_random_user(db, old_password)
    user = utils.activate_random_user(db, user)
    token = security.generate_token(str(user.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    response_1 = client.put("/users/password", headers=header, json={
        "old_password": utils.random_lower_string(),
        "new_password": new_password,
        "confirm_password": new_password,
    })
    response_2 = client.put("/users/password", headers=header, json={
        "old_password": old_password,
        "new_password": new_password,
        "confirm_password": new_password,
    })
    assert response_1.status_code == 400
    db.refresh(user)
    assert response_2.status_code == 204
    assert security.verify_password(new_password, user.hashed_password)

    db.delete(user)
    db.commit()
   

def test_activate(client: TestClient, db: Session) -> None:
    user_1 = utils.create_random_user(db)
    user_2 = utils.create_random_user(db)
    utils.activate_random_user(db, user_1)
    token_1 = security.generate_token(str(user_1.id), "activate", datetime.utcnow() + timedelta(hours=2))
    token_2 = security.generate_token(str(uuid4()), "activate", datetime.utcnow() + timedelta(hours=2))
    token_3 = security.generate_token(str(user_2.id), "activate", datetime.utcnow() + timedelta(hours=2))
    # User already active
    response_1 = client.put("/users/activate", json={
        "token": token_1
    })
    # User not found
    response_2 = client.put("/users/activate", json={
        "token": token_2
    })
    # Activate normally
    response_3 = client.put("/users/activate", json={
        "token": token_3
    })
    assert response_1.status_code == 400
    assert response_2.status_code == 404
    db.refresh(user_2)
    assert response_3.status_code == 200
    assert user_2.is_active == True
    

def test_get_user_me(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    provider = utils.create_random_provider(db)
    user = utils.activate_random_user(db, user)
    provider = utils.activate_random_user(db, provider)
    appointment = utils.create_random_appointment(db, provider, user)
    user = utils.activate_random_user(db, user)
    token = security.generate_token(str(user.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    response = client.get("/users/me", headers=header)
    data = response.json()
    assert response.status_code == 200
    assert data
    assert data[0]['user_id'] == str(user.id)
    assert "provider" in data[0]

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()
   