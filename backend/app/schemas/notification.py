from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

class ObjectIdStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, ObjectId):
            raise ValueError("Not a valid ObjectId")
        return str(v)

class Notification(BaseModel):
    id: ObjectIdStr
    recipient_id: str
    content: str
    read: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class ReadNotification(BaseModel):
    doc_id: str
        