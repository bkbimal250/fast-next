"""
Analytics reporting and insights
"""

from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.analytics.models import AnalyticsEvent


def get_popular_locations(db: Session, limit: int = 10, days: int | None = None):
    """
    Get most popular locations by event count.

    If `days` is provided, only events within that time window are counted.
    Returns a list of dicts: [{"city": str, "event_count": int}, ...]
    """
    query = db.query(
        AnalyticsEvent.city,
        func.count(AnalyticsEvent.id).label("event_count"),
    )

    if days is not None and days > 0:
        since = datetime.utcnow() - timedelta(days=days)
        query = query.filter(AnalyticsEvent.created_at >= since)

    results = (
        query.group_by(AnalyticsEvent.city)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(limit)
        .all()
    )

    # Convert SQLAlchemy Row objects to dictionaries
    return [
        {"city": row.city, "event_count": row.event_count}
        for row in results
        if row.city  # Filter out None cities
    ]


def get_job_impressions(db: Session, job_id: int):
    """Get total impressions for a job"""
    return (
        db.query(AnalyticsEvent)
        .filter(
            AnalyticsEvent.job_id == job_id,
            AnalyticsEvent.event_type == "page_view",
        )
        .count()
    )


def get_event_counts_by_day(db: Session, days: int = 30):
    """
    Get total analytics events per day for the last `days` days.
    Returns a list of dicts: [{ 'date': 'YYYY-MM-DD', 'event_count': int }, ...]
    """
    now = datetime.utcnow()
    since = now - timedelta(days=days)

    # Group by date (without time)
    rows = (
        db.query(
            func.date(AnalyticsEvent.created_at).label("event_date"),
            func.count(AnalyticsEvent.id).label("event_count"),
        )
        .filter(AnalyticsEvent.created_at >= since)
        .group_by(func.date(AnalyticsEvent.created_at))
        .order_by(func.date(AnalyticsEvent.created_at))
        .all()
    )

    return [
        {"date": str(row.event_date), "event_count": row.event_count} for row in rows
    ]

