from datetime import datetime
from typing import List
from app.models.notification import Notification as ModelNotification

def create(provider_id: str, msg: str) -> None:
    """
    To do unit test passes test as true 
    """
    object = ModelNotification(
        content=msg,
        recipient_id=provider_id
    )
    object.save()
    return object.id

def get_all_notifications(provider_id: str) -> List[dict]:
    queryset: ModelNotification = ModelNotification.objects(
        recipient_id=provider_id,
        read=False
    ).all()

    notification = []
    for q in queryset:
        value = q.to_mongo().to_dict()
        value['id'] = value['_id']
        notification.append(value)
    return notification

def update(doc_id: str) -> None:
    """
    To do unit test passes test as true 
    """
    ModelNotification.objects(id=doc_id).update_one(
        read=True, 
        updated_at=datetime.utcnow()
    )