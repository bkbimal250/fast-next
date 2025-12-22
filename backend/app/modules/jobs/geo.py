"""
Geographic search utilities for jobs
"""

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
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
    Get jobs near a location using PostgreSQL.
    Uses PostGIS ST_DWithin for optimal performance (when PostGIS is enabled),
    otherwise filters by distance in Python.
    """
    # Eagerly load relationships for better performance
    query_options = [
        joinedload(Job.city),
        joinedload(Job.area),
        joinedload(Job.state),
        joinedload(Job.country),
        joinedload(Job.spa),
        joinedload(Job.job_type),
        joinedload(Job.job_category),
    ]
    
    # TODO: Implement PostGIS query when PostGIS extension is enabled
    # For now, get all active jobs with coordinates and filter by distance in Python
    jobs = db.query(Job).options(*query_options).filter(
        Job.is_active == True,
        Job.latitude.isnot(None),
        Job.longitude.isnot(None)
    ).limit(limit * 2).all()  # Get more to filter by distance
    
    # Filter by distance
    nearby_jobs = []
    for job in jobs:
        if job.latitude and job.longitude:
            distance = calculate_distance(latitude, longitude, job.latitude, job.longitude)
            if distance <= radius_km:
                nearby_jobs.append(job)
                if len(nearby_jobs) >= limit:
                    break
    
    return nearby_jobs

