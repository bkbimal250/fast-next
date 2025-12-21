"""
SEO utilities for jobs
"""

import json
from app.modules.jobs.models import Job


def generate_job_schema(job: Job) -> dict:
    """Generate JSON-LD schema for a job"""
    from datetime import datetime, timedelta
    
    # Build hiring organization
    hiring_org = {
        "@type": "Organization",
        "name": job.spa.name if job.spa else "SPA"
    }
    if job.spa and job.spa.logo_image:
        hiring_org["logo"] = f"{job.spa.logo_image}"
    
    # Build address
    address = {
        "@type": "PostalAddress",
        "addressLocality": job.city.name if hasattr(job, 'city') and job.city else "",
        "addressRegion": job.state.name if hasattr(job, 'state') and job.state else "",
        "addressCountry": job.country.name if hasattr(job, 'country') and job.country else "IN"
    }
    if job.spa and job.spa.address:
        address["streetAddress"] = job.spa.address
    
    schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description or "",
        "datePosted": job.created_at.isoformat() if job.created_at else datetime.utcnow().isoformat(),
        "validThrough": (job.expires_at.isoformat() if job.expires_at else (datetime.utcnow() + timedelta(days=90)).isoformat()),
        "employmentType": job.Employee_type or "FULL_TIME",
        "hiringOrganization": hiring_org,
        "jobLocation": {
            "@type": "Place",
            "address": address
        }
    }
    
    if job.salary_min and job.salary_max:
        schema["baseSalary"] = {
            "@type": "MonetaryAmount",
            "currency": job.salary_currency or "INR",
            "value": {
                "@type": "QuantitativeValue",
                "minValue": job.salary_min,
                "maxValue": job.salary_max,
                "unitText": "MONTH"
            }
        }
    
    if job.experience_years_min:
        schema["experienceRequirements"] = {
            "@type": "OccupationalExperienceRequirements",
            "monthsOfExperience": job.experience_years_min * 12
        }
    
    if job.key_skills:
        schema["skills"] = [skill.strip() for skill in job.key_skills.split(',') if skill.strip()]
    
    if job.job_category:
        category_name = job.job_category.name if hasattr(job.job_category, 'name') else str(job.job_category)
        schema["occupationalCategory"] = category_name
    
    return schema

