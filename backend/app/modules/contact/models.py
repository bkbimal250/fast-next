"""
Contact form model
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    
    # Contact info
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=True)
    subject = Column(String(50), nullable=False, default="Female Therapist jobs")  # Job-specific subjects from ContactSubject enum
    
    # Status tracking
    status = Column(String(20), default="new")  # "new", "read", "replied", "closed"
    read_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

