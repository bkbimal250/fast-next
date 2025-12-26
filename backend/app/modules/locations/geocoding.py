"""
Reverse geocoding service using OpenStreetMap Nominatim API
Includes caching and rate limiting
"""

import httpx
import time
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.config import settings
from app.modules.locations.models import ResolvedLocation


# Rate limiting: track last request time
# COMMENTED OUT - Can be uncommented later when needed
# _last_request_time: float = 0


# def _rate_limit():
#     """Ensure we don't exceed Nominatim's rate limit (1 request per second)"""
#     global _last_request_time
#     current_time = time.time()
#     time_since_last = current_time - _last_request_time
#     
#     if time_since_last < settings.NOMINATIM_RATE_LIMIT_SECONDS:
#         sleep_time = settings.NOMINATIM_RATE_LIMIT_SECONDS - time_since_last
#         time.sleep(sleep_time)
#     
#     _last_request_time = time.time()


async def reverse_geocode_nominatim(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
    """
    Reverse geocode using Nominatim API
    Returns address components or None if failed
    """
    # Rate limiting commented out - can be uncommented later when needed
    # _rate_limit()
    
    url = f"{settings.NOMINATIM_BASE_URL}/reverse"
    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "json",
        "addressdetails": 1,
        "zoom": 18,  # High detail level
    }
    
    headers = {
        "User-Agent": settings.NOMINATIM_USER_AGENT
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if not data or "address" not in data:
                return None
            
            address = data.get("address", {})
            
            # Extract address components (Nominatim field names vary by region)
            result = {
                "city": (
                    address.get("city") or 
                    address.get("town") or 
                    address.get("village") or
                    address.get("municipality") or
                    None
                ),
                "area": (
                    address.get("suburb") or 
                    address.get("neighbourhood") or
                    address.get("locality") or
                    None
                ),
                "state": (
                    address.get("state") or 
                    address.get("region") or
                    None
                ),
                "country": address.get("country", "India"),
                "postcode": address.get("postcode"),
                "formatted_address": data.get("display_name"),
            }
            
            return result
            
    except Exception as e:
        print(f"Error reverse geocoding: {e}")
        return None


def get_cached_location(
    db: Session, 
    latitude: float, 
    longitude: float,
    tolerance: float = 0.001  # ~100 meters
) -> Optional[ResolvedLocation]:
    """
    Check if we have a cached location within tolerance
    """
    # Round to reduce cache misses for very similar coordinates
    lat_rounded = round(latitude, 4)
    lng_rounded = round(longitude, 4)
    
    # Look for cached location within tolerance
    cached = db.query(ResolvedLocation).filter(
        ResolvedLocation.latitude.between(lat_rounded - tolerance, lat_rounded + tolerance),
        ResolvedLocation.longitude.between(lng_rounded - tolerance, lng_rounded + tolerance)
    ).first()
    
    if cached:
        # Update last_used timestamp
        cached.last_used = datetime.utcnow()
        db.commit()
        return cached
    
    return None


def cache_location(
    db: Session,
    latitude: float,
    longitude: float,
    address_data: Dict[str, Any]
) -> ResolvedLocation:
    """
    Cache a resolved location in the database
    """
    resolved = ResolvedLocation(
        latitude=latitude,
        longitude=longitude,
        city=address_data.get("city"),
        area=address_data.get("area"),
        state=address_data.get("state"),
        country=address_data.get("country"),
        postcode=address_data.get("postcode"),
        formatted_address=address_data.get("formatted_address"),
    )
    
    db.add(resolved)
    db.commit()
    db.refresh(resolved)
    return resolved


async def reverse_geocode(
    db: Session,
    latitude: float,
    longitude: float
) -> Optional[Dict[str, Any]]:
    """
    Main reverse geocoding function with caching
    Returns address data or None
    """
    # Check cache first
    cached = get_cached_location(db, latitude, longitude)
    if cached:
        return {
            "city": cached.city,
            "area": cached.area,
            "state": cached.state,
            "country": cached.country,
            "postcode": cached.postcode,
            "formatted_address": cached.formatted_address,
            "latitude": cached.latitude,
            "longitude": cached.longitude,
            "cached": True,
        }
    
    # Not in cache, call Nominatim
    address_data = await reverse_geocode_nominatim(latitude, longitude)
    
    if address_data:
        # Cache the result
        cache_location(db, latitude, longitude, address_data)
        address_data["cached"] = False
        address_data["latitude"] = latitude
        address_data["longitude"] = longitude
        return address_data
    
    return None

