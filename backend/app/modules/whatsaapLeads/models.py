
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class WhatsaapLeads(Base):
    __tablename__ = "whatsaap_leads"

    id = Column(Integer, primary_key=True)

    name = Column(String, nullable=False)
    phone = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)

    job_profile = Column(String, index=True, nullable=False)
    experience = Column(
        Enum("fresher", "experienced", name="experience_enum"),
        nullable=False
    )

    street = Column(String, nullable=True)

    status = Column(
        Enum(
            "new",
            "genuine",
            "not_reachable",
            "fake",
            "shortlisted",
            "rejected",
            name="lead_status_enum"
        ),
        default="new",
        index=True
    )

    remarks = Column(Text, nullable=True)

    created_by = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=True,
    index=True
)

    updated_by = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=True,
    index=True
)

    remarks_by = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=True,
    index=True
)

    read_by = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=True,
    index=True
)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)




class LeadFollowUp(Base):
    __tablename__ = "lead_followups"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("whatsaap_leads.id"))
    admin_id = Column(Integer, ForeignKey("users.id"))

    action = Column(Enum("call", "remark", "status_change", name="action_enum"))
    note = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
