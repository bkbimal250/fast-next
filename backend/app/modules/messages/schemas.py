"""
Message Pydantic schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class MessageBase(BaseModel):
    job_id: int
    spa_id: int
    sender_name: str
    phone: str
    email: EmailStr
    message: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

