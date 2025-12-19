"""
Application Pydantic schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ApplicationBase(BaseModel):
    job_id: int
    name: str
    phone: str
    email: EmailStr
    experience: Optional[str] = None
    location: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    cv_file: Optional[str] = None  # File path after upload


class ApplicationResponse(ApplicationBase):
    id: int
    user_id: Optional[int] = None
    cv_file_path: Optional[str] = None
    status: str = "pending"
    created_at: datetime
    
    class Config:
        from_attributes = True

