from app.models.notification import Notification
import json
from uuid import uuid4
from pathlib import Path
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.tests import utils
from app.core import security
from app.core.config import settings

def test_list_providers(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    token = security.generate_token(str(user.id), 'access', datetime.utcnow() + timedelta(days=1))
    header = {'Authorization': f'Bearer {token}'}
    response = client.get('/providers', headers=header)
    data = response.json()
    assert response.status_code == 200
    assert data
    assert data[0]['id'] != str(user.id)

    db.delete(user)
    db.delete(provider)
    db.commit()
   
    
def test_get_provider_me(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token = security.generate_token(str(provider.id), 'access', datetime.utcnow() + timedelta(days=1))
    header = {'Authorization': f'Bearer {token}'}
    day = appointment.date.day
    month = appointment.date.month
    year = appointment.date.year
    response = client.get(f'/providers/me?day={day}&month={month}&year={year}', headers=header)
    data = response.json()
    assert response.status_code == 200
    assert data
    assert data[0]['provider_id'] == str(provider.id)
    assert "user" in data[0]

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()
    

def test_list_provider_days_availability(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token = security.generate_token(str(provider.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    month = appointment.date.month
    year = appointment.date.year
    response = client.get(
        f"/providers/month-availability?provider_id=2deee015-b1dd-4d08-8ce6-99b17a7477a8&month={month}&year={year}", 
        headers=header
    )
    data = response.json()
    assert response.status_code == 200
    assert data
    assert "day" in data[0]
    assert "available" in data[0]

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()

def test_list_provider_hours_availability(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token = security.generate_token(str(provider.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    day = appointment.date.day
    month = appointment.date.month
    year = appointment.date.year
    response = client.get(
        f"/providers/day-availability?provider_id=2deee015-b1dd-4d08-8ce6-99b17a7477a8&day={day}&month={month}&year={year}", 
        headers=header
    )
    data = response.json()
    assert response.status_code == 200
    assert data
    assert "hour" in data[0]
    assert "available" in data[0]

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()

def test_list_provider_notifications(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    notification = utils.create_random_notification(provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token = security.generate_token(str(provider.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    response = client.get("/providers/notifications", headers=header)
    data = response.json()
    assert response.status_code == 200
    assert data
    assert data[0]['recipient_id'] == str(provider.id)

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()
    Notification.delete(notification)

def test_update_notification(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    notification = utils.create_random_notification(provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token = security.generate_token(str(provider.id), "access", datetime.utcnow() + timedelta(hours=2))
    header = {'Authorization': f'Bearer {token}'}
    response = client.put("/providers/notifications", headers=header, json={
        "doc_id": str(notification.id)
    })
    document = Notification.objects(id=notification.id).first()
    assert response.status_code == 204
    assert document.read == True

    db.delete(user)
    db.delete(provider)
    db.delete(appointment)
    db.commit()
    Notification.delete(notification)

