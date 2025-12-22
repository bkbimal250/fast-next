"""
Message Pydantic schemas
"""

from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, Union
from datetime import datetime


class MessageBase(BaseModel):
    job_id: int
    sender_name: str
    phone: str
    email: Optional[EmailStr] = None
    message: str
    
    @model_validator(mode='before')
    @classmethod
    def preprocess_email(cls, data: dict) -> dict:
        """Convert empty string to None for email before validation"""
        if isinstance(data, dict) and 'email' in data:
            if data['email'] == "" or data['email'] is None:
                data['email'] = None
        return data


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    status: Optional[str] = None  # new | read | replied | closed


class MessageResponse(BaseModel):
    id: int
    job_id: int
    sender_name: str
    phone: str
    email: Optional[str] = None
    message: str
    status: str
    read_at: Optional[datetime] = None
    replied_at: Optional[datetime] = None
    read_by_id: Optional[int] = None
    replied_by_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Related data
    job: Optional[dict] = None
    read_by_name: Optional[str] = None
    replied_by_name: Optional[str] = None
    
    class Config:
        from_attributes = True

