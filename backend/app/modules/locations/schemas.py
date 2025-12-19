"""
Location Pydantic schemas
"""

from pydantic import BaseModel
from typing import Optional, List


# Country Schemas
class CountryBase(BaseModel):
    name: str


class CountryCreate(CountryBase):
    pass


class CountryUpdate(CountryBase):
    name: Optional[str] = None


class CountryResponse(CountryBase):
    id: int
    
    class Config:
        from_attributes = True


# State Schemas
class StateBase(BaseModel):
    name: str
    country_id: int


class StateCreate(StateBase):
    pass


class StateUpdate(BaseModel):
    name: Optional[str] = None
    country_id: Optional[int] = None


class StateResponse(StateBase):
    id: int
    country: Optional[CountryResponse] = None
    
    class Config:
        from_attributes = True


# City Schemas
class CityBase(BaseModel):
    name: str
    state_id: int
    country_id: int


class CityCreate(CityBase):
    pass


class CityUpdate(BaseModel):
    name: Optional[str] = None
    state_id: Optional[int] = None
    country_id: Optional[int] = None


class CityResponse(CityBase):
    id: int
    state: Optional[StateResponse] = None
    country: Optional[CountryResponse] = None
    
    class Config:
        from_attributes = True


# Area Schemas
class AreaBase(BaseModel):
    name: str
    city_id: int


class AreaCreate(AreaBase):
    pass


class AreaUpdate(BaseModel):
    name: Optional[str] = None
    city_id: Optional[int] = None


class AreaResponse(AreaBase):
    id: int
    city: Optional[CityResponse] = None
    
    class Config:
        from_attributes = True


class ReverseGeocodeRequest(BaseModel):
    latitude: float
    longitude: float


class ReverseGeocodeResponse(BaseModel):
    city: Optional[str] = None
    area: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postcode: Optional[str] = None
    formatted_address: Optional[str] = None
    latitude: float
    longitude: float
    cached: bool = False


class IPLocationResponse(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

