from uuid import uuid4
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.tests import utils
from app.core import security

def test_access_token(client: TestClient, db: Session) -> None:
    password = utils.random_lower_string()
    user = utils.create_random_user(db, password)
    # Wrong email
    response_1 = client.post('/sessions/access-token', json={
        "email": utils.random_email(),
        "password": password,
        "host": "mobile"
    })
    # Wrong password
    response_2 = client.post('/sessions/access-token', json={
        "email": user.email,
        "password": utils.random_lower_string(),
        "host": "mobile"
    })
    # Email not yet verified
    response_3 = client.post('/sessions/access-token', json={
        "email": user.email,
        "password": password,
        "host": "mobile"
    })
    # Wrong platform
    response_4 = client.post('/sessions/access-token', json={
        "email": user.email,
        "password": password,
        "host": "web"
    })
    # All right
    user = utils.activate_random_user(db, user)
    response_5 = client.post('/sessions/access-token', json={
        "email": user.email,
        "password": password,
        "host": "mobile"
    })
    assert response_1.status_code == 400
    assert response_2.status_code == 400
    assert response_3.status_code == 401
    assert response_4.status_code == 401
    data = response_5.json()
    assert response_5.status_code == 200
    assert "user" in data
    assert "token" in data
    assert data["token"]
    
def test_request_forgot_password(client: TestClient, db: Session) -> None:
    password = utils.random_lower_string()
    user = utils.create_random_user(db, password)
    user = utils.activate_random_user(db, user)
    response_1 = client.post('/sessions/forgot-password', json={
        "email": user.email,
    })
    response_2 = client.post('/sessions/forgot-password', json={
        "email": utils.random_email(),
    })
    assert response_1.status_code == 200
    assert response_2.status_code == 404

def test_request_reset_password(client: TestClient, db: Session) -> None:
    new_password = utils.random_lower_string()
    confirm_password = new_password
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    token_1 = security.generate_token(str(uuid4()), "reset", datetime.utcnow() + timedelta(hours=2)) 
    token_2 = security.generate_token(str(user.id), "reset", datetime.utcnow() + timedelta(hours=2)) 
    response_1 = client.post('/sessions/reset-password', json={
        "new_password": new_password,
        "confirm_password": confirm_password,
        "token": token_1
    })
    response_2 = client.post('/sessions/reset-password', json={
        "new_password": new_password,
        "confirm_password": confirm_password,
        "token": token_2
    })
    db.refresh(user)
    assert response_1.status_code == 404
    assert response_2.status_code == 200
    assert security.verify_password(new_password, user.hashed_password)