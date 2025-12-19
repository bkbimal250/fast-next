"""
SEO utilities for jobs
"""

import json
from app.modules.jobs.models import Job


def generate_job_schema(job: Job) -> dict:
    """Generate JSON-LD schema for a job"""
    schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "datePosted": job.created_at.isoformat(),
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.spa.name if job.spa else "SPA"
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.city.name if hasattr(job, 'city') else "",
            }
        }
    }
    
    if job.salary_min and job.salary_max:
        schema["baseSalary"] = {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": {
                "@type": "QuantitativeValue",
                "minValue": job.salary_min,
                "maxValue": job.salary_max,
                "unitText": "MONTH"
            }
        }
    
    return schema

