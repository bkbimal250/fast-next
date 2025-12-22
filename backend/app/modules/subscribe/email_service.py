"""
Email service for sending job notifications
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from jinja2 import Template
from app.core.config import settings
from app.modules.jobs.models import Job
from sqlalchemy.orm import Session


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send email using SMTP
    Returns True if successful, False otherwise
    """
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD, settings.SMTP_FROM_EMAIL]):
        print(f"[EMAIL] SMTP not configured. Would send to {to_email}: {subject}")
        return False  # In development, just log instead of sending
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = to_email
        
        # Add text and HTML parts
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_PORT == 587,
        )
        
        print(f"[EMAIL] Successfully sent to {to_email}: {subject}")
        return True
        
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {str(e)}")
        return False


def generate_job_email_html(jobs: List[Job], subscriber_name: Optional[str] = None, frequency: str = "daily") -> str:
    """
    Generate HTML email content for job notifications
    """
    site_url = settings.SITE_URL or "http://localhost:3000"
    greeting = f"Hello {subscriber_name}," if subscriber_name else "Hello,"
    
    frequency_text = {
        "daily": "today",
        "weekly": "this week",
        "monthly": "this month",
        "instant": "just posted"
    }.get(frequency, "today")
    
    jobs_html = ""
    for job in jobs:
        salary_text = "Not Disclosed"
        if job.salary_min and job.salary_max:
            salary_text = f"₹{job.salary_min/1000:.0f}k - ₹{job.salary_max/1000:.0f}k PA"
        elif job.salary_min:
            salary_text = f"₹{job.salary_min/1000:.0f}k+ PA"
        
        location_parts = []
        if job.city:
            location_parts.append(job.city.name)
        if job.state:
            location_parts.append(job.state.name)
        location = ", ".join(location_parts) if location_parts else "Location not specified"
        
        job_url = f"{site_url}/jobs/{job.slug}"
        
        jobs_html += f"""
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: #ffffff;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">
                <a href="{job_url}" style="color: #2563eb; text-decoration: none;">{job.title}</a>
            </h3>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong>Company:</strong> {job.spa.name if job.spa else 'SPA'}
            </p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong>Location:</strong> {location}
            </p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong>Salary:</strong> {salary_text}
            </p>
            <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">
                {job.description[:200]}{'...' if len(job.description) > 200 else ''}
            </p>
            <a href="{job_url}" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Job Details
            </a>
        </div>
        """
    
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Opportunities</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-top: 0;">New Job Opportunities {frequency_text.title()}</h1>
            <p>{greeting}</p>
            <p>We found <strong>{len(jobs)}</strong> new job{'s' if len(jobs) != 1 else ''} that might interest you:</p>
            
            {jobs_html}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                    <a href="{site_url}/jobs" style="color: #2563eb; text-decoration: none;">Browse All Jobs</a>
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 5px 0;">
                    You're receiving this because you subscribed to job notifications.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_template


def generate_job_email_text(jobs: List[Job], subscriber_name: Optional[str] = None, frequency: str = "daily") -> str:
    """
    Generate plain text email content for job notifications
    """
    greeting = f"Hello {subscriber_name}," if subscriber_name else "Hello,"
    frequency_text = {
        "daily": "today",
        "weekly": "this week",
        "monthly": "this month",
        "instant": "just posted"
    }.get(frequency, "today")
    
    site_url = settings.SITE_URL or "http://localhost:3000"
    
    text = f"""
{greeting}

We found {len(jobs)} new job{'s' if len(jobs) != 1 else ''} {frequency_text} that might interest you:

"""
    
    for i, job in enumerate(jobs, 1):
        salary_text = "Not Disclosed"
        if job.salary_min and job.salary_max:
            salary_text = f"₹{job.salary_min/1000:.0f}k - ₹{job.salary_max/1000:.0f}k PA"
        elif job.salary_min:
            salary_text = f"₹{job.salary_min/1000:.0f}k+ PA"
        
        location_parts = []
        if job.city:
            location_parts.append(job.city.name)
        if job.state:
            location_parts.append(job.state.name)
        location = ", ".join(location_parts) if location_parts else "Location not specified"
        
        job_url = f"{site_url}/jobs/{job.slug}"
        
        text += f"""
{i}. {job.title}
   Company: {job.spa.name if job.spa else 'SPA'}
   Location: {location}
   Salary: {salary_text}
   View: {job_url}

"""
    
    text += f"""
Browse all jobs: {site_url}/jobs

You're receiving this because you subscribed to job notifications.
"""
    
    return text

