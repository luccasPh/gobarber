import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import DateTime, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    address = Column(String, nullable=True, default=None)
    email = Column(String, unique=True, index=True, nullable=False)
    avatar = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow())

    provider_appointments = relationship(
        "Appointment", 
        foreign_keys="Appointment.provider_id",
        backref="provider",
        lazy='subquery'
    )
    user_appointments = relationship(
        "Appointment", 
        foreign_keys="Appointment.user_id",
        backref="user",
        lazy='subquery'
    )