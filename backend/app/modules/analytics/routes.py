"""
Analytics API routes
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.analytics import trackers, reports
from app.modules.analytics.chatbot_reports import get_chatbot_usage
from app.utils.ip_location import get_location_from_ip

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/track")
async def track_event(
    request: Request,
    event_type: str,
    job_id: int | None = None,
    spa_id: int | None = None,
    city: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    db: Session = Depends(get_db),
):
    """Track an analytics event"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Auto-detect location from IP if not provided
    if not latitude or not longitude:
        ip_location = get_location_from_ip(client_ip)
        if ip_location:
            latitude = latitude or ip_location.get('latitude')
            longitude = longitude or ip_location.get('longitude')
            city = city or ip_location.get('city')

    trackers.track_event(
        db=db,
        event_type=event_type,
        job_id=job_id,
        spa_id=spa_id,
        city=city,
        latitude=latitude,
        longitude=longitude,
        user_agent=user_agent,
        ip_address=client_ip,
    )

    return {"status": "tracked"}


@router.get("/popular-locations")
def get_popular_locations(
    limit: int = 10,
    days: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Get most popular locations.

    Optional:
    - days: if provided, only count events within the last `days` days.
    """
    return reports.get_popular_locations(db, limit=limit, days=days)


@router.get("/chatbot-usage")
def get_chatbot_usage_stats(db: Session = Depends(get_db)):
    """
    Get chatbot usage counts (unique users) for:
    - daily
    - weekly
    - monthly
    - yearly
    - total (all time)
    """
    return get_chatbot_usage(db)


@router.get("/time-series")
def get_time_series(
    days: int = 30,
    db: Session = Depends(get_db),
):
    """
    Get total analytics events per day for the last `days` days.
    Used for time-based analytics charts.
    """
    return reports.get_event_counts_by_day(db, days=days)


@router.get("/event-counts")
def get_event_counts(
    days: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Get total event counts by event type (page_view, apply_click, etc.).
    If `days` is provided, only count events within that time window.
    Returns: {"page_view": int, "apply_click": int, "cv_upload": int, "chat_opened": int}
    """
    return reports.get_event_counts_by_type(db, days=days)


@router.get("/location-from-ip")
async def get_location_from_ip_endpoint(request: Request):
    """Get location information from client IP address"""
    client_ip = request.client.host if request.client else "unknown"
    location = get_location_from_ip(client_ip)
    
    if location:
        return {
            "success": True,
            "location": location
        }
    return {
        "success": False,
        "message": "Could not determine location from IP"
    }

