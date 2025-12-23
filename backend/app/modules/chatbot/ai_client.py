"""
AI client for extracting job search filters from user messages
"""

import json
import re
from typing import Dict, Optional
from app.core.config import settings


async def extract_filters(message: str) -> Dict:
    """
    Extract job search filters from user message.
    
    This is a simple rule-based extractor. In production, you can replace this
    with an actual AI API call (OpenAI, Anthropic, etc.).
    
    For now, we use pattern matching to extract filters.
    """
    message_lower = message.lower().strip()
    
    # Initialize response
    filters = {
        "intent": "unknown",
        "job_role": None,
        "city": None,
        "area": None,
        "gender": None,
        "job_type": None,
        "near_me": False,
    }
    
    # Check for greeting
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    if any(greeting in message_lower for greeting in greetings):
        filters["intent"] = "greeting"
        return filters
    
    # Check for job search intent
    job_keywords = ["job", "jobs", "position", "vacancy", "opening", "hiring", "career", "work", "employment"]
    if any(keyword in message_lower for keyword in job_keywords) or len(message_lower) > 5:
        filters["intent"] = "job_search"
    
    # Extract job role
    job_roles = {
        "therapist": ["therapist", "massage therapist", "spa therapist", "massage", "body massage"],
        "manager": ["manager", "spa manager", "salon manager", "supervisor"],
        "receptionist": ["receptionist", "front desk", "reception", "front office"],
        "beautician": ["beautician", "beauty therapist", "aesthetician", "beauty"],
        "technician": ["technician", "nail technician", "hair technician"],
        "housekeeping": ["housekeeping", "attendant", "helper", "cleaning"],
        "sales": ["sales", "marketing", "telecaller", "membership"],
    }
    for role, keywords in job_roles.items():
        if any(keyword in message_lower for keyword in keywords):
            filters["job_role"] = role
            break
    
    # Extract location (simple pattern matching)
    # Common Indian cities (expanded list)
    cities = [
        "mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune", "kolkata", 
        "ahmedabad", "jaipur", "surat", "navi mumbai", "gurgaon", "noida", "faridabad",
        "goa", "indore", "bhopal", "lucknow", "kanpur", "nagpur", "coimbatore", "kochi"
    ]
    for city in cities:
        if city in message_lower:
            filters["city"] = city.title()
            break
    
    # Extract "near me"
    if "near me" in message_lower or "nearby" in message_lower or "close to me" in message_lower:
        filters["near_me"] = True
    
    # Extract job type
    if "full-time" in message_lower or "full time" in message_lower:
        filters["job_type"] = "full-time"
    elif "part-time" in message_lower or "part time" in message_lower:
        filters["job_type"] = "part-time"
    elif "contract" in message_lower:
        filters["job_type"] = "contract"
    
    # Extract gender preference
    if "male" in message_lower or "men" in message_lower:
        filters["gender"] = "male"
    elif "female" in message_lower or "women" in message_lower or "ladies" in message_lower:
        filters["gender"] = "female"
    
    return filters


# Optional: Integration with actual AI API (OpenAI, Anthropic, etc.)
# Uncomment and configure when ready to use real AI
"""
import openai
from app.core.config import settings

async def extract_filters_with_ai(message: str) -> Dict:
    '''Extract filters using OpenAI API'''
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": CHATBOT_SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0.1,
            max_tokens=200
        )
        content = response.choices[0].message.content.strip()
        # Parse JSON from response
        filters = json.loads(content)
        return filters
    except Exception as e:
        print(f"AI extraction error: {e}")
        # Fallback to rule-based
        return await extract_filters(message)
"""

