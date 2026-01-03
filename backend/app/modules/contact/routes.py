"""
Contact form API routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.modules.contact import schemas, models
from app.modules.users.routes import require_role
from app.modules.users.models import UserRole

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("/", response_model=schemas.ContactResponse, status_code=201)
def create_contact(
    contact: schemas.ContactCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a contact form message.
    No authentication required - anyone can contact us.
    """
    db_contact = models.ContactMessage(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact


@router.get("/", response_model=list[schemas.ContactResponse])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Get all contact messages (admin and manager only).
    Can filter by status: "new", "read", "replied", "closed"
    """
    query = db.query(models.ContactMessage)
    
    if status:
        if status == "new":
            # Include both "new" status and None (which should be treated as new)
            query = query.filter(
                (models.ContactMessage.status == "new") | (models.ContactMessage.status == None)
            )
        else:
            query = query.filter(models.ContactMessage.status == status)
    
    contacts = query.order_by(models.ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=schemas.ContactResponse)
def get_contact(
    contact_id: int,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Get a specific contact message by ID (admin and manager only)"""
    contact = db.query(models.ContactMessage).filter(models.ContactMessage.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact message not found")
    return contact


@router.put("/{contact_id}/status", response_model=schemas.ContactResponse)
def update_contact_status(
    contact_id: int,
    update_data: dict,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Update contact message status (admin and manager only).
    Status can be: new, read, replied, closed
    """
    contact = db.query(models.ContactMessage).filter(models.ContactMessage.id == contact_id).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact message not found")
    
    status = update_data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    if status not in ["new", "read", "replied", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be: new, read, replied, or closed")
    
    contact.status = status
    
    # Track when read/replied
    if status == "read" and not contact.read_at:
        contact.read_at = datetime.utcnow()
    elif status == "replied" and not contact.replied_at:
        contact.replied_at = datetime.utcnow()
    
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)
    
    return contact


@router.get("/stats/summary", response_model=dict)
def get_contact_stats(
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Get contact message statistics (admin and manager only).
    """
    total = db.query(models.ContactMessage).count()
    # Handle None status as "new"
    new_count = db.query(models.ContactMessage).filter(
        (models.ContactMessage.status == "new") | (models.ContactMessage.status == None)
    ).count()
    read_count = db.query(models.ContactMessage).filter(models.ContactMessage.status == "read").count()
    replied_count = db.query(models.ContactMessage).filter(models.ContactMessage.status == "replied").count()
    closed_count = db.query(models.ContactMessage).filter(models.ContactMessage.status == "closed").count()
    
    return {
        "total": total,
        "new": new_count,
        "read": read_count,
        "replied": replied_count,
        "closed": closed_count
    }


@router.delete("/{contact_id}", status_code=204)
def delete_contact(
    contact_id: int,
    permanent: bool = False,
    current_user = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Delete a contact message (admin only).
    
    - permanent=True: Permanently delete from database
    - permanent=False: Soft delete (currently same as permanent, but can be extended)
    """
    contact = db.query(models.ContactMessage).filter(models.ContactMessage.id == contact_id).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact message not found")
    
    # Delete the contact message
    db.delete(contact)
    db.commit()
    
    return None
