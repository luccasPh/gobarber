from app.models.notification import Notification
from sqlalchemy.orm.session import Session
from mongoengine.connection import connect

from app.crud import crud_notification
from app.tests import utils

from app.core.config import settings

connect(settings.MONGO_DB, host=settings.MONGO_HOST, port=settings.MONGO_PORT)

def test_create_notification(db: Session) -> None:
    provider = utils.create_random_provider(db)
    message = utils.random_lower_string()
    document_id = crud_notification.create(str(provider.id), message)
    notification = Notification.objects(id=document_id).first()
    assert notification
    assert notification.content == message
    assert notification.recipient_id == str(provider.id)

    db.delete(provider)
    db.commit()
    Notification.delete(notification)

def test_get_all_notifications(db: Session) -> None:
    provider = utils.create_random_provider(db)
    document = utils.create_random_notification(provider)
    provider_notifications = crud_notification.get_all_notifications(str(provider.id))
    assert provider_notifications
    assert provider_notifications[0]['id'] == document.id
    assert provider_notifications[0]['recipient_id'] == str(provider.id)

    db.delete(provider)
    db.commit()

def test_update_notification(db: Session) -> None:
    provider = utils.create_random_provider(db)
    notification = utils.create_random_notification(provider)
    crud_notification.update(notification.id)
    update_notification = Notification.objects(id=notification.id).first()
    assert update_notification

    db.delete(provider)
    db.commit()
    Notification.delete(notification)


