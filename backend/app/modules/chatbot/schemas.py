"""
Chatbot schemas
"""

from pydantic import BaseModel
from typing import Optional, List


class ChatbotRequest(BaseModel):
    """Request schema for chatbot search"""
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ChatbotJob(BaseModel):
    """Job suggestion schema for chatbot response"""
    id: int
    title: str
    spa_name: str
    location: str
    salary: Optional[str] = None
    apply_url: str
    slug: str


class ChatbotSpa(BaseModel):
    """SPA suggestion schema for chatbot response"""
    id: int
    name: str
    location: str
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    view_url: str
    slug: str


class ChatbotResponse(BaseModel):
    """Response schema for chatbot search"""
    message: str
    jobs: List[ChatbotJob] = []
    spas: List[ChatbotSpa] = []
    suggestions: List[str] = []  # Suggested queries user can try

