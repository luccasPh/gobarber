import pytz
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.tests import utils
from app.core import security

def test_create_appointments(client: TestClient, db: Session) -> None:
    user = utils.create_random_user(db)
    user = utils.activate_random_user(db, user)
    provider = utils.create_random_provider(db)
    provider = utils.activate_random_user(db, provider)
    appointment = utils.create_random_appointment(db, provider, user)
    token_1 = security.generate_token(str(user.id), 'access', datetime.utcnow() + timedelta(days=1))
    token_2 = security.generate_token(str(provider.id), 'access', datetime.utcnow() + timedelta(days=1))
    header_1 = {'Authorization': f'Bearer {token_1}'}
    header_2 = {'Authorization': f'Bearer {token_2}'}
    date_1 = datetime(2020, 10, 10, 10, 10)
    date_2 = datetime.now(timezone.utc)
    date_2 = date_2.replace(hour=10)
    date_2 = date_2.replace(day = date_2.day+1)
    date_3 = datetime.now(timezone.utc)
    date_3 = date_3.replace(hour=1)
    date_3 = date_3.replace(day= date_3.day+1)
    date_4 = appointment.date
    # Not being able to make an appointment for past dates
    response_1 = client.post('/appointments', headers=header_1, json={
        "provider_id": str(provider.id),
        "date": str(date_1)
    })
    # Can only create appointments between 8:00 and 17:00
    response_2 = client.post('/appointments', headers=header_1, json={
        "provider_id": str(provider.id),
        "date": str(date_3)
    })
    # Not being able to make an appointment with yourself
    response_3 = client.post('/appointments', headers=header_2, json={
        "provider_id": str(provider.id),
        "date": str(date_2)
    })
    # Appointment date already used
    response_4 = client.post('/appointments', headers=header_1, json={
        "provider_id": str(provider.id),
        "date":  str(date_4)
    })
    # Appointment create normally
    response_5 = client.post('/appointments', headers=header_1, json={
        "provider_id": str(provider.id),
        "date": str(date_2)
    })
    assert response_1.status_code == 400
    assert response_2.status_code == 400
    assert response_3.status_code == 400
    assert response_4.status_code == 400
    data = response_5.json()
    assert response_5.status_code == 201
    assert data
    assert data['user_id'] == str(user.id)
    assert data['provider_id'] == str(provider.id)