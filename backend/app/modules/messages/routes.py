"""
Message API routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.messages import schemas, models

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=schemas.MessageResponse)
def create_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db)
):
    """Send a message to SPA (no login required)"""
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

