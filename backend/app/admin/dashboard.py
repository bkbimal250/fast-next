"""
Admin dashboard utilities
"""

from sqlalchemy.orm import Session
from app.modules.analytics import reports
from app.modules.jobs.models import Job, JobApplication


def get_dashboard_stats(db: Session):
    """Get dashboard statistics"""
    total_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_applications = db.query(JobApplication).count()
    popular_locations = reports.get_popular_locations(db, limit=5)
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "popular_locations": popular_locations
    }

