"""
Job Pydantic schemas
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.modules.locations.schemas import CityResponse, AreaResponse, StateResponse, CountryResponse
from app.modules.spas.schemas import SpaResponse
from app.modules.users.schemas import UserResponse


class JobBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    key_skills: Optional[str] = None
    Industry_type: Optional[str] = "Beauty and Spa"
    Employee_type: Optional[str] = "Full Time"
    job_opening_count: Optional[int] = 1
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = "INR"
    experience_years_min: Optional[int] = None
    experience_years_max: Optional[int] = None
    spa_id: int
    job_type_id: Optional[int] = None
    job_category_id: Optional[int] = None
    country_id: int
    state_id: int
    city_id: int
    area_id: Optional[int] = None

    # HR contact info (for direct communication)
    hr_contact_name: Optional[str] = None
    hr_contact_email: Optional[str] = None
    hr_contact_phone: Optional[str] = None
    # latitude/longitude can be omitted on create; they'll be copied from Spa
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    seo_schema_json: Optional[str] = Field(None, description="JSON-LD schema for SEO", alias="schema_json", serialization_alias="schema_json")
    canonical_url: Optional[str] = None


class JobCreate(JobBase):
    is_featured: Optional[bool] = False
    expires_at: Optional[datetime] = None


# JobType Schemas (defined before JobResponse to avoid forward reference issues)
class JobTypeBase(BaseModel):
    name: str
    description: Optional[str] = None


class JobTypeCreate(JobTypeBase):
    pass


class JobTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class JobTypeResponse(JobTypeBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# JobCategory Schemas (defined before JobResponse to avoid forward reference issues)
class JobCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class JobCategoryCreate(JobCategoryBase):
    pass


class JobCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class JobCategoryResponse(JobCategoryBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    experience_years_min: Optional[int] = None
    experience_years_max: Optional[int] = None
    responsibilities: Optional[str] = None
    key_skills: Optional[str] = None
    Industry_type: Optional[str] = None
    Employee_type: Optional[str] = None
    job_opening_count: Optional[int] = None
    spa_id: Optional[int] = None
    job_type_id: Optional[int] = None
    job_category_id: Optional[int] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    area_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hr_contact_name: Optional[str] = None
    hr_contact_email: Optional[str] = None
    hr_contact_phone: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    expires_at: Optional[datetime] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    seo_schema_json: Optional[str] = Field(None, description="JSON-LD schema for SEO", alias="schema_json", serialization_alias="schema_json")
    canonical_url: Optional[str] = None


class JobResponse(JobBase):
    id: int
    slug: str
    is_active: bool
    is_featured: bool
    view_count: int = 0
    apply_click_count: int = 0
    message_count: int = 0
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime] = None
    # Nested relationships
    city: Optional[CityResponse] = None
    area: Optional[AreaResponse] = None
    state: Optional[StateResponse] = None
    country: Optional[CountryResponse] = None
    spa: Optional[SpaResponse] = None
    job_type: Optional[JobTypeResponse] = None
    job_category: Optional[JobCategoryResponse] = None
    created_by_user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

