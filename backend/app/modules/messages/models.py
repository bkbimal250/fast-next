"""
Message model for free job inquiries (no login required)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    # Job relation
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    job = relationship("Job", back_populates="messages")

    # Sender info (guest user)
    sender_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(120), nullable=True)

    message = Column(Text, nullable=False)

    # Message status
    status = Column(String(20), default="new")  
    # new | read | replied | closed

    # Read / reply tracking
    read_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)

    read_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    replied_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    read_by = relationship("User", foreign_keys=[read_by_id])
    replied_by = relationship("User", foreign_keys=[replied_by_id])

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
