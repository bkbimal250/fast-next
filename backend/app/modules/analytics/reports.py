"""
Analytics reporting and insights
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.analytics.models import AnalyticsEvent


def get_popular_locations(db: Session, limit: int = 10):
    """Get most popular locations by event count"""
    return db.query(
        AnalyticsEvent.city,
        func.count(AnalyticsEvent.id).label("event_count")
    ).group_by(
        AnalyticsEvent.city
    ).order_by(
        func.count(AnalyticsEvent.id).desc()
    ).limit(limit).all()


def get_job_impressions(db: Session, job_id: int):
    """Get total impressions for a job"""
    return db.query(AnalyticsEvent).filter(
        AnalyticsEvent.job_id == job_id,
        AnalyticsEvent.event_type == "page_view"
    ).count()

