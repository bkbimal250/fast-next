"""
Analytics models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime
from app.core.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)  # page_view, apply_click, cv_upload, job_search, spa_booking_click, etc.
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True, nullable=True)
    spa_id = Column(Integer, ForeignKey("spas.id"), index=True, nullable=True)
    city = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    user_agent = Column(String)
    ip_hash = Column(String, index=True)  # Hashed IP for privacy - indexed for unique visitor queries
    device_type = Column(String, index=True)  # mobile, desktop, tablet - indexed for device analytics
    search_query = Column(Text, nullable=True)  # Store search queries for job searches
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

