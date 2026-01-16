"""
Analytics tracking utilities
"""

import hashlib
from sqlalchemy.orm import Session
from app.modules.analytics.models import AnalyticsEvent
from app.utils.device_detection import detect_device_type


def hash_ip(ip: str) -> str:
    """Hash IP address for privacy"""
    return hashlib.sha256(ip.encode()).hexdigest()


def track_event(
    db: Session,
    event_type: str,
    job_id: int = None,
    spa_id: int = None,
    city: str = None,
    latitude: float = None,
    longitude: float = None,
    user_agent: str = None,
    ip_address: str = None,
    device_type: str = None,
    search_query: str = None
):
    """Track an analytics event"""
    # Auto-detect device type if not provided
    if not device_type and user_agent:
        device_type = detect_device_type(user_agent)
    
    event = AnalyticsEvent(
        event_type=event_type,
        job_id=job_id,
        spa_id=spa_id,
        city=city,
        latitude=latitude,
        longitude=longitude,
        user_agent=user_agent,
        ip_hash=hash_ip(ip_address) if ip_address else None,
        device_type=device_type,
        search_query=search_query
    )
    db.add(event)
    db.commit()
    return event

