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


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None


# Simple job info for application response
class JobInfo(BaseModel):
    id: int
    title: str
    slug: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    spa_id: Optional[int] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    country_id: Optional[int] = None
    job_type_id: Optional[int] = None
    job_category_id: Optional[int] = None
    
    model_config = {"from_attributes": True}


class ApplicationResponse(ApplicationBase):
    id: int
    user_id: Optional[int] = None
    cv_file_path: Optional[str] = None
    status: str = "pending"
    created_at: datetime
    job: Optional[JobInfo] = None
    
    model_config = {"from_attributes": True}

