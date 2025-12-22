"""
Chatbot service - glues AI extraction with job search
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.jobs import services as job_services
from app.modules.jobs.models import Job
from app.modules.chatbot.ai_client import extract_filters


def format_job_for_chatbot(job: Job) -> dict:
    """Format a Job model instance for chatbot response"""
    location_parts = []
    if job.city:
        location_parts.append(job.city.name)
    if job.area:
        location_parts.append(job.area.name)
    if job.state:
        location_parts.append(job.state.name)
    
    location = ", ".join(location_parts) if location_parts else "Location not specified"
    
    # Format salary
    salary = None
    if job.salary_min or job.salary_max:
        salary_parts = []
        if job.salary_min:
            salary_parts.append(f"{job.salary_currency or 'INR'} {job.salary_min:,}")
        if job.salary_max:
            salary_parts.append(f"{job.salary_currency or 'INR'} {job.salary_max:,}")
        salary = " - ".join(salary_parts) if len(salary_parts) > 1 else salary_parts[0]
    
    spa_name = job.spa.name if job.spa else "Unknown SPA"
    
    return {
        "id": job.id,
        "title": job.title,
        "spa_name": spa_name,
        "location": location,
        "salary": salary,
        "slug": job.slug,
        "apply_url": f"/jobs/{job.slug}",
    }


async def chatbot_search(
    db: Session,
    message: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> dict:
    """
    Main chatbot search function.
    Extracts filters from message and searches jobs using existing job services.
    """
    # Extract filters from user message
    filters = await extract_filters(message)
    
    # Handle non-job-search intents
    if filters["intent"] == "greeting":
        return {
            "message": "Hello! I can help you find spa jobs. What kind of job are you looking for?",
            "jobs": [],
        }
    
    if filters["intent"] != "job_search":
        return {
            "message": "I can help you find spa jobs. Try asking like 'I need therapist jobs in Mumbai' or 'Show me part-time jobs near me'.",
            "jobs": [],
        }
    
    # Map filters to job service parameters
    # Note: We need to convert city name to city_id, job_role to job_category, etc.
    # For now, we'll do a simple search and filter in memory
    # In production, you'd want to enhance job_services.get_jobs to support text search
    
    # Get all active jobs (we'll filter them)
    all_jobs = job_services.get_jobs(
        db=db,
        skip=0,
        limit=100,  # Get more jobs to filter
        job_type=filters["job_type"],
        job_category=None,  # We'll filter by role name
    )
    
    # Filter jobs based on extracted criteria
    filtered_jobs = []
    for job in all_jobs:
        # Filter by job role (check job category name)
        if filters["job_role"]:
            if job.job_category:
                category_name_lower = job.job_category.name.lower()
                if filters["job_role"].lower() not in category_name_lower:
                    continue
        
        # Filter by city
        if filters["city"]:
            if job.city:
                if filters["city"].lower() not in job.city.name.lower():
                    continue
        
        # Filter by gender (if job has gender requirement)
        # Note: This assumes your Job model has a gender field
        # If not, you can skip this filter
        
        filtered_jobs.append(job)
        
        # Limit results
        if len(filtered_jobs) >= 5:
            break
    
    # Format jobs for response
    formatted_jobs = [format_job_for_chatbot(job) for job in filtered_jobs]
    
    # Generate response message
    if formatted_jobs:
        message_text = f"I found {len(formatted_jobs)} job{'s' if len(formatted_jobs) > 1 else ''} matching your search."
    else:
        message_text = "I couldn't find any jobs matching your criteria. Try adjusting your search terms or browse all jobs."
    
    return {
        "message": message_text,
        "jobs": formatted_jobs,
    }

