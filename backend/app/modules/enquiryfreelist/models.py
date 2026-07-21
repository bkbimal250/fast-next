"""
Free listing enquiry models.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.core.database import Base


class FreeListingEnquiry(Base):
    __tablename__ = "free_listing_enquiries"

    id = Column(Integer, primary_key=True, index=True)

    contact_name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)

    business_name = Column(String(180), nullable=False)
    business_type = Column(String(50), nullable=False, default="spa")
    address = Column(Text, nullable=True)
    city = Column(String(120), nullable=True, index=True)
    website = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)

    status = Column(String(30), nullable=False, default="new", index=True)
    is_verified = Column(Boolean, nullable=False, default=False, index=True)
    followup_notes = Column(Text, nullable=True)

    credential_email = Column(String(255), nullable=True)
    credential_notes = Column(Text, nullable=True)
    credentials_sent_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    contacted_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
