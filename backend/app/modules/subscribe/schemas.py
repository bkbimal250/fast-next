"""
Subscription Pydantic schemas
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.modules.subscribe.models import SubscriptionFrequency


class SubscriptionBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    frequency: SubscriptionFrequency = SubscriptionFrequency.DAILY
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    job_category_id: Optional[int] = None
    job_type_id: Optional[int] = None


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    frequency: Optional[SubscriptionFrequency] = None
    is_active: Optional[bool] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    job_category_id: Optional[int] = None
    job_type_id: Optional[int] = None


class SubscriptionResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    frequency: str
    is_active: bool
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    job_category_id: Optional[int] = None
    job_type_id: Optional[int] = None
    last_email_sent_at: Optional[datetime] = None
    emails_sent_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UnsubscribeRequest(BaseModel):
    token: str


class UnsubscribeResponse(BaseModel):
    success: bool
    message: str

