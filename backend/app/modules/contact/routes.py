"""
Contact form API routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.contact import schemas, models

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
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all contact messages (admin only).
    Can filter by status: "new", "read", "replied", "closed"
    """
    # TODO: Add admin authentication check
    query = db.query(models.ContactMessage)
    
    if status:
        query = query.filter(models.ContactMessage.status == status)
    
    contacts = query.order_by(models.ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=schemas.ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific contact message by ID (admin only)"""
    # TODO: Add admin authentication check
    contact = db.query(models.ContactMessage).filter(models.ContactMessage.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact message not found")
    return contact

