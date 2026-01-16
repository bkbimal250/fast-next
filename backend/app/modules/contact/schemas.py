"""
Contact form schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ContactSubject(str, Enum):
    """Contact form subject options"""
    Therapist = "Female Therapist jobs"
    spaTherapist = "Thai Therapist jobs"
    manager = "Male Spa Manager jobs"
    receptionist = "Female Receptionist jobs"
    housekeeping = "Male Housekeeping jobs"


class ContactCreate(BaseModel):
    """Schema for creating a contact message"""
    name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    phone: str = Field(..., min_length=10, max_length=20, description="Contact phone number")
    message: Optional[str] = Field(None, max_length=2000, description="Contact message")
    subject: ContactSubject = Field(default=ContactSubject.Therapist, description="Contact subject")


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

