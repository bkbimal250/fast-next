from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ExperienceEnum(str, Enum):
    fresher = "fresher"
    experienced = "experienced"


class LeadStatusEnum(str, Enum):
    new = "new"
    genuine = "genuine"
    not_reachable = "not_reachable"
    fake = "fake"
    shortlisted = "shortlisted"
    rejected = "rejected"


class FollowUpActionEnum(str, Enum):
    call = "call"
    remark = "remark"
    status_change = "status_change"


class WhatsaapLeadCreate(BaseModel):
    name: str
    phone: str = Field(..., min_length=10, max_length=15)
    age: int
    job_profile: str
    experience: ExperienceEnum
    street: Optional[str] = None

class WhatsaapLeadUpdate(BaseModel):
    status: Optional[LeadStatusEnum] = None
    remarks: Optional[str] = None

class WhatsaapLeadResponse(BaseModel):
    id: int
    name: str
    phone: str
    age: int
    job_profile: str
    experience: ExperienceEnum
    street: Optional[str]
    status: LeadStatusEnum
    remarks: Optional[str]

    created_by: Optional[int]
    updated_by: Optional[int]
    remarks_by: Optional[int]
    read_by: Optional[int]

    created_at: datetime
    updated_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class LeadFollowUpCreate(BaseModel):
    lead_id: int
    action: FollowUpActionEnum
    note: Optional[str] = None

class LeadFollowUpResponse(BaseModel):
    id: int
    lead_id: int
    admin_id: int
    action: FollowUpActionEnum
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminFollowUpStats(BaseModel):
    admin_id: int
    total_leads_followed: int


class LeadStatusStats(BaseModel):
    status: LeadStatusEnum
    total: int
