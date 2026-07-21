"""
Free listing enquiry schemas.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class FreeListingBusinessType(str, Enum):
    spa = "spa"
    salon = "salon"
    wellness_center = "wellness_center"
    other = "other"


class FreeListingStatus(str, Enum):
    new = "new"
    contacted = "contacted"
    verified = "verified"
    credentials_sent = "credentials_sent"
    closed = "closed"


class FreeListingEnquiryCreate(BaseModel):
    contact_name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=8, max_length=20)
    email: EmailStr
    business_name: str = Field(..., min_length=1, max_length=180)
    business_type: FreeListingBusinessType = FreeListingBusinessType.spa
    address: Optional[str] = Field(None, max_length=1000)
    city: Optional[str] = Field(None, max_length=120)
    website: Optional[str] = Field(None, max_length=255)
    message: Optional[str] = Field(None, max_length=2000)


class FreeListingFollowupUpdate(BaseModel):
    status: Optional[FreeListingStatus] = None
    followup_notes: Optional[str] = Field(None, max_length=4000)


class FreeListingVerificationUpdate(BaseModel):
    is_verified: bool = True
    followup_notes: Optional[str] = Field(None, max_length=4000)


class FreeListingCredentialsUpdate(BaseModel):
    credential_email: Optional[EmailStr] = None
    credential_notes: Optional[str] = Field(None, max_length=4000)


class FreeListingEnquiryResponse(BaseModel):
    id: int
    contact_name: str
    phone: str
    email: str
    business_name: str
    business_type: str
    address: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    message: Optional[str] = None
    status: str
    is_verified: bool
    followup_notes: Optional[str] = None
    credential_email: Optional[str] = None
    credential_notes: Optional[str] = None
    credentials_sent_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    contacted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
