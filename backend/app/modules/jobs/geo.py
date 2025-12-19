"""
Geographic search utilities for jobs
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.jobs.models import Job
from app.core.config import settings
from app.utils.geo_utils import calculate_distance


def get_jobs_near_location(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10,
    limit: int = 50
):
    """
    Get jobs near a location.
    Uses PostGIS ST_DWithin for PostgreSQL, or Python calculation for SQLite.
    """
    if settings.DATABASE_TYPE == "postgresql":
        # PostGIS query: ST_DWithin(geom, point, distance_in_meters)
        # radius_km * 1000 converts to meters
        radius_meters = radius_km * 1000
        
        # TODO: Implement PostGIS query when PostGIS extension is enabled
        # For now, return all active jobs
        jobs = db.query(Job).filter(
            Job.is_active == True
        ).limit(limit * 2).all()  # Get more to filter by distance
    else:
        # SQLite: Get all active jobs and filter by distance in Python
        jobs = db.query(Job).filter(
            Job.is_active == True,
            Job.latitude.isnot(None),
            Job.longitude.isnot(None)
        ).limit(limit * 2).all()
    
    # Filter by distance (works for both SQLite and PostgreSQL)
    nearby_jobs = []
    for job in jobs:
        if job.latitude and job.longitude:
            distance = calculate_distance(latitude, longitude, job.latitude, job.longitude)
            if distance <= radius_km:
                nearby_jobs.append(job)
                if len(nearby_jobs) >= limit:
                    break
    
    return nearby_jobs

