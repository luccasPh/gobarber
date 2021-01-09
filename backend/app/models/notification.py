from mongoengine.document import Document
from mongoengine.fields import *
from datetime import datetime

class Notification(Document):
    content = StringField()
    recipient_id = StringField()
    read = BooleanField(default=False)

    created_at = DateTimeField(default=datetime.utcnow())
    updated_at = DateTimeField(default=datetime.utcnow())