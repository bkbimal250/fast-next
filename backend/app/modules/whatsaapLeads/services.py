from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime
from typing import Optional

from app.modules.whatsaapLeads.models import WhatsaapLeads, LeadFollowUp
from app.modules.whatsaapLeads.schemas import (
    WhatsaapLeadCreate,
    WhatsaapLeadUpdate,
    LeadFollowUpCreate,
)





def create_whatsapp_lead(
    db: Session,
    lead_data: WhatsaapLeadCreate
):
    lead = WhatsaapLeads(
        name=lead_data.name,
        phone=lead_data.phone,
        age=lead_data.age,
        job_profile=lead_data.job_profile,
        experience=lead_data.experience,
        street=lead_data.street,
        status="new",
        created_at=datetime.utcnow()
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def get_lead_by_id(db: Session, lead_id: int) -> Optional[WhatsaapLeads]:
    return db.query(WhatsaapLeads).filter(WhatsaapLeads.id == lead_id).first()


def list_leads(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    job_profile: Optional[str] = None,
    phone: Optional[str] = None,
    unread_only: bool = False,
):
    query = db.query(WhatsaapLeads)

    if status:
        query = query.filter(WhatsaapLeads.status == status)

    if job_profile:
        # partial match
        query = query.filter(WhatsaapLeads.job_profile.ilike(f"%{job_profile}%"))

    if phone:
        query = query.filter(WhatsaapLeads.phone.ilike(f"%{phone}%"))

    if unread_only:
        query = query.filter(WhatsaapLeads.read_at.is_(None))

    return (
        query.order_by(WhatsaapLeads.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def mark_lead_as_read(
    db: Session,
    lead_id: int,
    admin_id: int
):
    lead = get_lead_by_id(db, lead_id)

    if not lead:
        return None

    if lead.read_at is None:
        lead.read_by = admin_id
        lead.read_at = datetime.utcnow()
        db.commit()

    return lead


def update_whatsapp_lead(
    db: Session,
    lead_id: int,
    admin_id: int,
    update_data: WhatsaapLeadUpdate
):
    lead = get_lead_by_id(db, lead_id)

    if not lead:
        return None

    if update_data.status:
        lead.status = update_data.status
        lead.updated_by = admin_id

        followup = LeadFollowUp(
            lead_id=lead.id,
            admin_id=admin_id,
            action="status_change",
            note=f"Status changed to {update_data.status}"
        )
        db.add(followup)

    if update_data.remarks:
        lead.remarks = update_data.remarks
        lead.remarks_by = admin_id

        followup = LeadFollowUp(
            lead_id=lead.id,
            admin_id=admin_id,
            action="remark",
            note=update_data.remarks
        )
        db.add(followup)

    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    return lead


def create_lead_followup(
    db: Session,
    admin_id: int,
    followup_data: LeadFollowUpCreate
):
    followup = LeadFollowUp(
        lead_id=followup_data.lead_id,
        admin_id=admin_id,
        action=followup_data.action,
        note=followup_data.note
    )

    db.add(followup)
    db.commit()
    db.refresh(followup)
    return followup


def list_lead_followups(db: Session, lead_id: int):
    return (
        db.query(LeadFollowUp)
        .filter(LeadFollowUp.lead_id == lead_id)
        .order_by(LeadFollowUp.created_at.desc())
        .all()
    )


def get_admin_followup_counts(db: Session):
    return (
        db.query(
            LeadFollowUp.admin_id,
            func.count(distinct(LeadFollowUp.lead_id)).label("total_leads_followed")
        )
        .group_by(LeadFollowUp.admin_id)
        .all()
    )


def get_lead_status_stats(db: Session):
    return (
        db.query(
            WhatsaapLeads.status,
            func.count(WhatsaapLeads.id).label("total")
        )
        .group_by(WhatsaapLeads.status)
        .all()
    )


def get_leads_summary(db: Session):
    total = db.query(func.count(WhatsaapLeads.id)).scalar() or 0
    unread = db.query(func.count(WhatsaapLeads.id)).filter(WhatsaapLeads.read_at.is_(None)).scalar() or 0
    today = (
        db.query(func.count(WhatsaapLeads.id))
        .filter(func.date_trunc("day", WhatsaapLeads.created_at) == func.date_trunc("day", func.now()))
        .scalar()
        or 0
    )

    return {"total": total, "unread": unread, "today": today}


def get_daily_leads(db: Session):
    return (
        db.query(
            func.date_trunc("day", WhatsaapLeads.created_at).label("date"),
            func.count(WhatsaapLeads.id).label("total")
        )
        .group_by(func.date_trunc("day", WhatsaapLeads.created_at))
        .order_by(func.date_trunc("day", WhatsaapLeads.created_at))
        .all()
    )



def delete_lead(db: Session, lead_id: int):
    lead = get_lead_by_id(db, lead_id)

    if not lead:
        return None

    # Delete associated followups first to avoid FK constraint errors
    db.query(LeadFollowUp).filter(LeadFollowUp.lead_id == lead_id).delete()

    db.delete(lead)
    db.commit()
    return lead