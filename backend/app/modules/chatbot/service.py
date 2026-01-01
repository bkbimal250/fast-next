"""
Chatbot service - glues AI extraction with job search and SPA search
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.jobs import services as job_services
from app.modules.jobs.models import Job
from app.modules.spas import services as spa_services
from app.modules.spas.models import Spa
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


def format_spa_for_chatbot(spa: Spa) -> dict:
    """Format a Spa model instance for chatbot response"""
    location_parts = []
    if spa.city:
        location_parts.append(spa.city.name)
    if spa.area:
        location_parts.append(spa.area.name)
    if spa.state:
        location_parts.append(spa.state.name)
    
    location = ", ".join(location_parts) if location_parts else "Location not specified"
    
    return {
        "id": spa.id,
        "name": spa.name,
        "location": location,
        "address": spa.address,
        "phone": spa.phone,
        "rating": spa.rating,
        "slug": spa.slug,
        "view_url": f"/spas/{spa.slug}",
    }


def get_suggested_queries(filters: dict, has_location: bool = False) -> List[str]:
    """Generate suggested queries based on current filters"""
    suggestions = []
    
    if filters["intent"] == "greeting":
        suggestions = [
            "Find spa therapist jobs in Mumbai",
            "Show me part-time jobs near me",
            "Find spas near me",
            "Massage therapist jobs in Delhi",
        ]
    elif filters["intent"] == "job_search":
        if filters["city"]:
            city = filters["city"]
            suggestions = [
                f"Find all spa jobs in {city}",
                f"Part-time jobs in {city}",
                f"Full-time therapist jobs in {city}",
                f"Spa manager jobs in {city}",
            ]
        elif filters["near_me"]:
            suggestions = [
                "Find all jobs near me",
                "Part-time jobs nearby",
                "Therapist jobs near me",
                "Spa jobs nearby",
            ]
        else:
            suggestions = [
                "Find jobs in Mumbai",
                "Find jobs in Delhi",
                "Show part-time jobs",
                "Therapist jobs",
            ]
    elif filters["intent"] == "spa_search":
        if filters["city"]:
            city = filters["city"]
            suggestions = [
                f"Find spas in {city}",
                f"Best spas in {city}",
                f"Spas near me in {city}",
                f"Top spas in {city}",
            ]
        elif filters["near_me"]:
            suggestions = [
                "Find spas near me",
                "Best spas nearby",
                "Top spas near me",
                "Spas close to me",
            ]
        else:
            suggestions = [
                "Find spas in Mumbai",
                "Find spas in Delhi",
                "Best spas near me",
                "Top spas",
            ]
    else:
        suggestions = [
            "Find spa jobs in Mumbai",
            "Show spas near me",
            "Therapist jobs in Delhi",
            "Part-time spa jobs",
        ]
    
    return suggestions[:4]  # Return max 4 suggestions


async def chatbot_search(
    db: Session,
    message: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> dict:
    """
    Main chatbot search function.
    Extracts filters from message and searches jobs OR SPAs (not both) using existing services.
    
    IMPORTANT: Returns ONLY jobs if intent is "job_search", ONLY spas if intent is "spa_search".
    """
    # Extract filters from user message
    filters = await extract_filters(message)
    
    # Handle greeting
    if filters["intent"] == "greeting":
        suggestions = get_suggested_queries(filters, has_location=bool(latitude and longitude))
        return {
            "message": "Hello! I can help you find spa jobs and spas. What are you looking for?",
            "jobs": [],
            "spas": [],
            "suggestions": suggestions,
        }
    
    # Handle unknown intent
    if filters["intent"] == "unknown":
        suggestions = get_suggested_queries(filters, has_location=bool(latitude and longitude))
        return {
            "message": "I can help you find spa jobs and spas. Try asking like 'I need therapist jobs in Mumbai' or 'Show me spas near me'.",
            "jobs": [],
            "spas": [],
            "suggestions": suggestions,
        }
    
    formatted_jobs = []
    formatted_spas = []
    
    # STRICT SEPARATION: Search for jobs ONLY if intent is job_search
    if filters["intent"] == "job_search":
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
            
            # Filter by "near me" using coordinates
            if filters["near_me"] and latitude and longitude:
                if job.latitude and job.longitude:
                    from app.utils.geo_utils import calculate_distance
                    distance = calculate_distance(latitude, longitude, job.latitude, job.longitude)
                    if distance > 10:  # Within 10km
                        continue
            
            filtered_jobs.append(job)
            
            # Limit results
            if len(filtered_jobs) >= 5:
                break
        
        # Format jobs for response
        formatted_jobs = [format_job_for_chatbot(job) for job in filtered_jobs]
        
        # Generate response message for jobs
        if formatted_jobs:
            message_text = f"I found {len(formatted_jobs)} job{'s' if len(formatted_jobs) > 1 else ''} matching your search."
        else:
            message_text = "I couldn't find any jobs matching your criteria. Try adjusting your search terms."
        
        suggestions = get_suggested_queries(filters, has_location=bool(latitude and longitude))
        
        return {
            "message": message_text,
            "jobs": formatted_jobs,
            "spas": [],  # Always empty for job_search
            "suggestions": suggestions,
        }
    
    # STRICT SEPARATION: Search for SPAs ONLY if intent is spa_search
    elif filters["intent"] == "spa_search":
        if filters["near_me"] and latitude and longitude:
            # Get SPAs near location
            nearby_spas = spa_services.get_spas_near_location(db, latitude, longitude, radius_km=10)
            formatted_spas = [format_spa_for_chatbot(spa) for spa in nearby_spas[:5]]
        elif filters["city"]:
            # Get SPAs by city
            all_spas = spa_services.get_spas(db, skip=0, limit=50, is_active=True)
            filtered_spas = []
            for spa in all_spas:
                if spa.city and filters["city"].lower() in spa.city.name.lower():
                    filtered_spas.append(spa)
                    if len(filtered_spas) >= 5:
                        break
            formatted_spas = [format_spa_for_chatbot(spa) for spa in filtered_spas]
        else:
            # Get all active SPAs
            all_spas = spa_services.get_spas(db, skip=0, limit=5, is_active=True)
            formatted_spas = [format_spa_for_chatbot(spa) for spa in all_spas]
        
        # Generate response message for spas
        if formatted_spas:
            message_text = f"I found {len(formatted_spas)} spa{'s' if len(formatted_spas) > 1 else ''} matching your search."
        else:
            message_text = "I couldn't find any spas matching your criteria. Try adjusting your search terms."
        
        suggestions = get_suggested_queries(filters, has_location=bool(latitude and longitude))
        
        return {
            "message": message_text,
            "jobs": [],  # Always empty for spa_search
            "spas": formatted_spas,
            "suggestions": suggestions,
        }
    
    # Fallback (should not reach here, but just in case)
    suggestions = get_suggested_queries(filters, has_location=bool(latitude and longitude))
    return {
        "message": "I can help you find spa jobs and spas. Please specify what you're looking for.",
        "jobs": [],
        "spas": [],
        "suggestions": suggestions,
    }

