"""
Contact form schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ContactSubject(str, Enum):
    """Contact form subject options"""
    JOBS = "jobs"
    JOBS_LISTING = "jobs listing"
    OTHERS = "others"


class ContactCreate(BaseModel):
    """Schema for creating a contact message"""
    name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    phone: str = Field(..., min_length=10, max_length=20, description="Contact phone number")
    message: Optional[str] = Field(None, max_length=2000, description="Contact message")
    subject: ContactSubject = Field(default=ContactSubject.OTHERS, description="Contact subject")


class ContactResponse(BaseModel):
    """Schema for contact message response"""
    id: int
    name: str
    phone: str
    message: Optional[str] = None
    subject: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

