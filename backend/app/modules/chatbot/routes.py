"""
Chatbot API routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.chatbot import schemas
from app.modules.chatbot.service import chatbot_search

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.post("/search", response_model=schemas.ChatbotResponse)
async def chatbot_search_api(
    payload: schemas.ChatbotRequest,
    db: Session = Depends(get_db),
):
    """
    Chatbot search endpoint.
    Takes a user message and returns job suggestions.
    """
    try:
        result = await chatbot_search(
            db=db,
            message=payload.message,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot search failed: {str(e)}")

