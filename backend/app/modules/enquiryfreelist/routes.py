"""
Free listing enquiry API routes.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.enquiryfreelist import models, schemas
from app.modules.users.models import UserRole
from app.modules.users.routes import require_role

router = APIRouter(prefix="/api/enquiryfreelist", tags=["free-listing-enquiries"])


@router.post("/", response_model=schemas.FreeListingEnquiryResponse, status_code=status.HTTP_201_CREATED)
def create_free_listing_enquiry(
    enquiry: schemas.FreeListingEnquiryCreate,
    db: Session = Depends(get_db),
):
    """Submit a free listing enquiry. Public endpoint."""
    db_enquiry = models.FreeListingEnquiry(**enquiry.model_dump())
    db.add(db_enquiry)
    db.commit()
    db.refresh(db_enquiry)
    return db_enquiry


@router.get("/stats/summary", response_model=dict)
def get_free_listing_stats(
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """Get free listing enquiry summary for dashboard users."""
    total = db.query(models.FreeListingEnquiry).count()
    new_count = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.status == "new").count()
    contacted_count = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.status == "contacted").count()
    verified_count = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.is_verified == True).count()
    credentials_sent_count = db.query(models.FreeListingEnquiry).filter(
        models.FreeListingEnquiry.status == "credentials_sent"
    ).count()

    return {
        "total": total,
        "new": new_count,
        "contacted": contacted_count,
        "verified": verified_count,
        "credentials_sent": credentials_sent_count,
    }


@router.get("/", response_model=list[schemas.FreeListingEnquiryResponse])
def get_free_listing_enquiries(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[schemas.FreeListingStatus] = None,
    verified: Optional[bool] = None,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """List free listing enquiries for follow-up."""
    query = db.query(models.FreeListingEnquiry)

    if status_filter:
        query = query.filter(models.FreeListingEnquiry.status == status_filter.value)

    if verified is not None:
        query = query.filter(models.FreeListingEnquiry.is_verified == verified)

    return query.order_by(models.FreeListingEnquiry.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{enquiry_id}", response_model=schemas.FreeListingEnquiryResponse)
def get_free_listing_enquiry(
    enquiry_id: int,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """Get one free listing enquiry."""
    enquiry = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Free listing enquiry not found")
    return enquiry


@router.put("/{enquiry_id}/followup", response_model=schemas.FreeListingEnquiryResponse)
def update_free_listing_followup(
    enquiry_id: int,
    update_data: schemas.FreeListingFollowupUpdate,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """Update follow-up notes and enquiry status."""
    enquiry = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Free listing enquiry not found")

    if update_data.status:
        enquiry.status = update_data.status.value
        if update_data.status == schemas.FreeListingStatus.contacted and not enquiry.contacted_at:
            enquiry.contacted_at = datetime.utcnow()

    if update_data.followup_notes is not None:
        enquiry.followup_notes = update_data.followup_notes

    enquiry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.put("/{enquiry_id}/verify", response_model=schemas.FreeListingEnquiryResponse)
def verify_free_listing_enquiry(
    enquiry_id: int,
    update_data: schemas.FreeListingVerificationUpdate,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """Mark a free listing enquiry as verified or not verified."""
    enquiry = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Free listing enquiry not found")

    enquiry.is_verified = update_data.is_verified
    enquiry.status = "verified" if update_data.is_verified else "contacted"
    enquiry.verified_at = datetime.utcnow() if update_data.is_verified else None

    if update_data.followup_notes is not None:
        enquiry.followup_notes = update_data.followup_notes

    enquiry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.put("/{enquiry_id}/credentials", response_model=schemas.FreeListingEnquiryResponse)
def mark_credentials_sent(
    enquiry_id: int,
    update_data: schemas.FreeListingCredentialsUpdate,
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db),
):
    """Record that credentials were sent after follow-up and verification."""
    enquiry = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Free listing enquiry not found")

    if not enquiry.is_verified:
        raise HTTPException(status_code=400, detail="Verify this enquiry before sending credentials")

    enquiry.credential_email = update_data.credential_email or enquiry.email
    enquiry.credential_notes = update_data.credential_notes
    enquiry.credentials_sent_at = datetime.utcnow()
    enquiry.status = "credentials_sent"
    enquiry.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_free_listing_enquiry(
    enquiry_id: int,
    current_user=Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Delete a free listing enquiry. Admin only."""
    enquiry = db.query(models.FreeListingEnquiry).filter(models.FreeListingEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Free listing enquiry not found")

    db.delete(enquiry)
    db.commit()
    return None
