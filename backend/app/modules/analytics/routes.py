"""
Analytics API routes
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.analytics import trackers, reports

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/track")
async def track_event(
    request: Request,
    event_type: str,
    job_id: int = None,
    spa_id: int = None,
    city: str = None,
    latitude: float = None,
    longitude: float = None,
    db: Session = Depends(get_db)
):
    """Track an analytics event"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    trackers.track_event(
        db=db,
        event_type=event_type,
        job_id=job_id,
        spa_id=spa_id,
        city=city,
        latitude=latitude,
        longitude=longitude,
        user_agent=user_agent,
        ip_address=client_ip
    )
    
    return {"status": "tracked"}


@router.get("/popular-locations")
def get_popular_locations(limit: int = 10, db: Session = Depends(get_db)):
    """Get most popular locations"""
    return reports.get_popular_locations(db, limit)

