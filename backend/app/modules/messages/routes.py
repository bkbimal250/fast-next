"""
Message API routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.modules.messages import schemas, models
from app.modules.users.routes import get_current_user, require_role
from app.modules.users.models import UserRole
from app.modules.jobs.models import Job

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=schemas.MessageResponse, status_code=201)
def create_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db)
):
    """
    Send a free message for a job (no login required).
    This allows users to inquire about jobs without creating an account.
    """
    # Verify job exists
    job = db.query(Job).filter(Job.id == message.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create message
    message_data = message.dict()
    # Ensure status is set (default to "new" if not provided)
    if "status" not in message_data or not message_data["status"]:
        message_data["status"] = "new"
    db_message = models.Message(**message_data)
    db.add(db_message)
    
    # Update job message count
    job.message_count = (job.message_count or 0) + 1
    
    db.commit()
    db.refresh(db_message)
    
    # Load relationships
    db.refresh(db_message, ["job", "read_by", "replied_by"])
    
    # Format response with job data
    msg_dict = {
        "id": db_message.id,
        "job_id": db_message.job_id,
        "sender_name": db_message.sender_name,
        "phone": db_message.phone,
        "email": db_message.email,
        "message": db_message.message,
        "status": db_message.status,
        "read_at": db_message.read_at,
        "replied_at": db_message.replied_at,
        "read_by_id": db_message.read_by_id,
        "replied_by_id": db_message.replied_by_id,
        "created_at": db_message.created_at,
        "updated_at": db_message.updated_at,
        "read_by_name": db_message.read_by.name if db_message.read_by else None,
        "replied_by_name": db_message.replied_by.name if db_message.replied_by else None,
    }
    if db_message.job:
        msg_dict["job"] = {
            "id": db_message.job.id,
            "title": db_message.job.title,
            "slug": db_message.job.slug,
        }
    
    return msg_dict


@router.get("/", response_model=List[schemas.MessageResponse])
def get_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    job_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Get all messages (admin and manager only).
    Can filter by job_id and status.
    """
    query = db.query(models.Message).options(
        joinedload(models.Message.job),
        joinedload(models.Message.read_by),
        joinedload(models.Message.replied_by)
    )
    
    if job_id:
        query = query.filter(models.Message.job_id == job_id)
    
    if status:
        if status == "new":
            # Include both "new" status and None (which should be treated as new)
            query = query.filter(
                (models.Message.status == "new") | (models.Message.status == None)
            )
        else:
            query = query.filter(models.Message.status == status)
    
    messages = query.order_by(models.Message.created_at.desc()).offset(skip).limit(limit).all()
    
    print(f"[DEBUG] Found {len(messages)} messages for user {current_user.id} (role: {current_user.role})")
    
    # Format messages with job data using Pydantic models
    result = []
    for msg in messages:
        msg_data = {
            "id": msg.id,
            "job_id": msg.job_id,
            "sender_name": msg.sender_name,
            "phone": msg.phone,
            "email": msg.email,
            "message": msg.message,
            "status": msg.status or "new",  # Ensure status has a default
            "read_at": msg.read_at,
            "replied_at": msg.replied_at,
            "read_by_id": msg.read_by_id,
            "replied_by_id": msg.replied_by_id,
            "created_at": msg.created_at,
            "updated_at": msg.updated_at,
            "read_by_name": msg.read_by.name if msg.read_by else None,
            "replied_by_name": msg.replied_by.name if msg.replied_by else None,
        }
        if msg.job:
            msg_data["job"] = {
                "id": msg.job.id,
                "title": msg.job.title,
                "slug": msg.job.slug,
            }
        
        # Create Pydantic model instance
        try:
            msg_response = schemas.MessageResponse(**msg_data)
            result.append(msg_response)
        except Exception as e:
            print(f"[ERROR] Failed to create MessageResponse for message {msg.id}: {e}")
            print(f"[ERROR] Message data: {msg_data}")
            # Fallback: return dict anyway
            result.append(msg_data)
    
    print(f"[DEBUG] Returning {len(result)} formatted messages")
    return result


@router.get("/{message_id}", response_model=schemas.MessageResponse)
def get_message(
    message_id: int,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Get a specific message by ID (admin and manager only).
    """
    message = db.query(models.Message).options(
        joinedload(models.Message.job),
        joinedload(models.Message.read_by),
        joinedload(models.Message.replied_by)
    ).filter(
        models.Message.id == message_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Format message with job data
    msg_dict = {
        "id": message.id,
        "job_id": message.job_id,
        "sender_name": message.sender_name,
        "phone": message.phone,
        "email": message.email,
        "message": message.message,
        "status": message.status,
        "read_at": message.read_at,
        "replied_at": message.replied_at,
        "read_by_id": message.read_by_id,
        "replied_by_id": message.replied_by_id,
        "created_at": message.created_at,
        "updated_at": message.updated_at,
        "read_by_name": message.read_by.name if message.read_by else None,
        "replied_by_name": message.replied_by.name if message.replied_by else None,
    }
    if message.job:
        msg_dict["job"] = {
            "id": message.job.id,
            "title": message.job.title,
            "slug": message.job.slug,
        }
    
    return msg_dict


@router.put("/{message_id}/status", response_model=schemas.MessageResponse)
def update_message_status(
    message_id: int,
    update_data: schemas.MessageUpdate,
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Update message status (admin and manager only).
    Status can be: new, read, replied, closed
    """
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if update_data.status:
        if update_data.status not in ["new", "read", "replied", "closed"]:
            raise HTTPException(status_code=400, detail="Invalid status. Must be: new, read, replied, or closed")
        
        message.status = update_data.status
        
        # Track who read/replied and when
        if update_data.status == "read" and not message.read_at:
            message.read_at = datetime.utcnow()
            message.read_by_id = current_user.id
        elif update_data.status == "replied" and not message.replied_at:
            message.replied_at = datetime.utcnow()
            message.replied_by_id = current_user.id
    
    db.commit()
    db.refresh(message)
    
    # Load relationships for response
    db.refresh(message, ["job", "read_by", "replied_by"])
    
    # Format message with job data
    msg_dict = {
        "id": message.id,
        "job_id": message.job_id,
        "sender_name": message.sender_name,
        "phone": message.phone,
        "email": message.email,
        "message": message.message,
        "status": message.status,
        "read_at": message.read_at,
        "replied_at": message.replied_at,
        "read_by_id": message.read_by_id,
        "replied_by_id": message.replied_by_id,
        "created_at": message.created_at,
        "updated_at": message.updated_at,
    }
    if message.job:
        msg_dict["job"] = {
            "id": message.job.id,
            "title": message.job.title,
            "slug": message.job.slug,
        }
    
    return msg_dict


@router.get("/stats/summary", response_model=dict)
def get_message_stats(
    current_user = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """
    Get message statistics (admin and manager only).
    """
    total = db.query(models.Message).count()
    # Handle None status as "new"
    new_count = db.query(models.Message).filter(
        (models.Message.status == "new") | (models.Message.status == None)
    ).count()
    read_count = db.query(models.Message).filter(models.Message.status == "read").count()
    replied_count = db.query(models.Message).filter(models.Message.status == "replied").count()
    closed_count = db.query(models.Message).filter(models.Message.status == "closed").count()
    
    print(f"[DEBUG] Message stats - Total: {total}, New: {new_count}, Read: {read_count}, Replied: {replied_count}, Closed: {closed_count}")
    
    return {
        "total": total,
        "new": new_count,
        "read": read_count,
        "replied": replied_count,
        "closed": closed_count
    }


@router.delete("/{message_id}", status_code=204)
def delete_message(
    message_id: int,
    permanent: bool = False,
    current_user = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Delete a message (admin only).
    
    - permanent=True: Permanently delete from database
    - permanent=False: Soft delete (currently same as permanent, but can be extended)
    """
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Delete the message
    db.delete(message)
    db.commit()
    
    return None
