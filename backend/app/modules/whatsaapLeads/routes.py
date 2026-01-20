"""
Whatsaap Leads routes

- Public lead creation (website form)
- Admin/Manager management: list, view, update, mark-read, followups, stats
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.modules.whatsaapLeads import schemas, services
from app.modules.users.routes import require_role
from app.modules.users.models import UserRole

router = APIRouter(prefix="/api/whatsaap-leads", tags=["whatsaap-leads"])


@router.post("/", response_model=schemas.WhatsaapLeadResponse, status_code=status.HTTP_201_CREATED)
def submit_lead(
    lead: schemas.WhatsaapLeadCreate,
    db: Session = Depends(get_db),
):
    """
    Public endpoint: website form submission.
    No authentication required.
    """
    return services.create_whatsapp_lead(db, lead)


@router.get("/", response_model=List[schemas.WhatsaapLeadResponse])
def list_leads(
    skip: int = 0,
    limit: int = 100,
    status: Optional[schemas.LeadStatusEnum] = None,
    job_profile: Optional[str] = None,
    phone: Optional[str] = None,
    unread_only: bool = False,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """
    Admin/Manager: list leads with filters.
    """
    return services.list_leads(
        db=db,
        skip=skip,
        limit=limit,
        status=status.value if status else None,
        job_profile=job_profile,
        phone=phone,
        unread_only=unread_only,
    )


@router.get("/{lead_id}", response_model=schemas.WhatsaapLeadResponse)
def get_lead(
    lead_id: int,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    lead = services.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=schemas.WhatsaapLeadResponse)
def update_lead(
    lead_id: int,
    update_data: schemas.WhatsaapLeadUpdate,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    lead = services.update_whatsapp_lead(db, lead_id, current_user.id, update_data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/{lead_id}/read", response_model=schemas.WhatsaapLeadResponse)
def mark_read(
    lead_id: int,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    lead = services.mark_lead_as_read(db, lead_id, current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/followups", response_model=schemas.LeadFollowUpResponse, status_code=status.HTTP_201_CREATED)
def create_followup(
    followup: schemas.LeadFollowUpCreate,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    # Ensure lead exists
    lead = services.get_lead_by_id(db, followup.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return services.create_lead_followup(db, current_user.id, followup)


@router.get("/{lead_id}/followups", response_model=List[schemas.LeadFollowUpResponse])
def list_followups(
    lead_id: int,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    lead = services.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return services.list_lead_followups(db, lead_id)


@router.get("/stats/admin-followups", response_model=List[schemas.AdminFollowUpStats])
def admin_followup_stats(
    current_user=Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    rows = services.get_admin_followup_counts(db)
    return [
        schemas.AdminFollowUpStats(admin_id=admin_id, total_leads_followed=total)
        for (admin_id, total) in rows
    ]


@router.get("/stats/summary", response_model=dict)
def leads_summary(
    current_user=Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    summary = services.get_leads_summary(db)
    status_rows = services.get_lead_status_stats(db)
    summary["by_status"] = {str(status): total for (status, total) in status_rows}
    return summary


@router.get("/stats/status", response_model=List[schemas.LeadStatusStats])
def lead_status_stats(
    current_user=Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    rows = services.get_lead_status_stats(db)
    return [schemas.LeadStatusStats(status=status, total=total) for (status, total) in rows]


@router.get("/stats/daily", response_model=list[dict])
def daily_leads_stats(
    current_user=Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    rows = services.get_daily_leads(db)
    return [{"date": str(date), "total": total} for (date, total) in rows]

