"""
SPA Pydantic schemas
"""

from pydantic import BaseModel, EmailStr, field_serializer, ConfigDict, HttpUrl
from typing import Optional, List, Union
from datetime import datetime


class SpaBase(BaseModel):
    name: str
    description: Optional[str] = None
    phone: str
    email: EmailStr
    logo_image: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    directions: Optional[Union[str, HttpUrl]] = None  # Google Maps directions URL
    opening_hours: Optional[str] = None
    closing_hours: Optional[str] = None
    booking_url_website: Optional[str] = None
    country_id: int
    state_id: int
    city_id: int
    area_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    spa_images: Optional[List[str]] = None
    rating: Optional[float] = 0.0
    reviews: Optional[float] = 0.0


class SpaCreate(SpaBase):
    pass


class SpaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_image: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    directions: Optional[Union[str, HttpUrl]] = None  # Google Maps directions URL
    opening_hours: Optional[str] = None
    closing_hours: Optional[str] = None
    booking_url_website: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    area_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    spa_images: Optional[List[str]] = None
    rating: Optional[float] = None
    reviews: Optional[float] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class SpaResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    phone: str
    email: str
    logo_image: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    directions: Optional[Union[str, HttpUrl]] = None  # Google Maps directions URL
    opening_hours: Optional[str] = None
    closing_hours: Optional[str] = None
    booking_url_website: Optional[str] = None
    country_id: int
    state_id: int
    city_id: int
    area_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    spa_images: Optional[List[str]] = None
    rating: Optional[float] = 0.0
    reviews: Optional[float] = 0.0
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value: datetime, _info) -> str:
        """Serialize datetime to ISO format string"""
        if value is None:
            return None
        return value.isoformat()
    
    model_config = ConfigDict(from_attributes=True)

