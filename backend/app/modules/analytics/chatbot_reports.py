"""
Chatbot-specific analytics reports
"""

from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.analytics.models import AnalyticsEvent


def get_chatbot_usage(db: Session) -> dict:
    """
    Return chatbot usage counts (unique users) for different time windows.

    We identify a "user" by the hashed IP (ip_hash) and count distinct hashes
    for events with event_type = 'chat_opened'.
    """
    now = datetime.utcnow()

    def _count_unique_since(delta: timedelta) -> int:
        since = now - delta
        return (
            db.query(func.count(func.distinct(AnalyticsEvent.ip_hash)))
            .filter(
                AnalyticsEvent.event_type == "chat_opened",
                AnalyticsEvent.created_at >= since,
            )
            .scalar()
            or 0
        )

    # Helper for "all time" total
    total = (
        db.query(func.count(func.distinct(AnalyticsEvent.ip_hash)))
        .filter(AnalyticsEvent.event_type == "chat_opened")
        .scalar()
        or 0
    )

    return {
        "total": total,
        "daily": _count_unique_since(timedelta(days=1)),
        "weekly": _count_unique_since(timedelta(days=7)),
        "monthly": _count_unique_since(timedelta(days=30)),
        "yearly": _count_unique_since(timedelta(days=365)),
    }


