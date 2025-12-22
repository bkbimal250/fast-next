"""
Subscription models for job email notifications
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, JSON
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship
import enum


class SubscriptionFrequency(str, enum.Enum):
    """Email notification frequency"""
    DAILY = "daily"  # Send daily digest
    WEEKLY = "weekly"  # Send weekly digest
    MONTHLY = "monthly"  # Send monthly digest
    INSTANT = "instant"  # Send immediately when new job posted


class JobSubscription(Base):
    __tablename__ = "job_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Subscriber info
    email = Column(String(120), nullable=False, index=True)
    name = Column(String(100), nullable=True)  # Optional name
    
    # User relation (if logged in)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    user = relationship("User", back_populates="subscriptions")
    
    # Subscription preferences
    frequency = Column(Enum(SubscriptionFrequency), default=SubscriptionFrequency.DAILY, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    
    # Filter preferences (optional - for personalized job recommendations)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    job_category_id = Column(Integer, ForeignKey("job_categories.id"), nullable=True)
    job_type_id = Column(Integer, ForeignKey("job_types.id"), nullable=True)
    
    # Tracking
    last_email_sent_at = Column(DateTime, nullable=True)
    emails_sent_count = Column(Integer, default=0)
    unsubscribe_token = Column(String(100), unique=True, nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    unsubscribed_at = Column(DateTime, nullable=True)
    
    # Relationships
    city = relationship("City")
    state = relationship("State")
    job_category = relationship("JobCategory")
    job_type = relationship("JobType")


class EmailNotificationLog(Base):
    """Track sent email notifications"""
    __tablename__ = "email_notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("job_subscriptions.id", ondelete="CASCADE"), nullable=True)
    email = Column(String(120), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    job_ids = Column(String(500), nullable=True)  # Comma-separated job IDs sent
    status = Column(String(20), default="sent")  # sent, failed, bounced
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    subscription = relationship("JobSubscription", backref="notification_logs")

