"""
Service for sending job notifications to subscribers
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.modules.subscribe import models
from app.modules.subscribe.models import SubscriptionFrequency
from app.modules.subscribe.email_service import send_email, generate_job_email_html, generate_job_email_text
from app.modules.jobs.models import Job


def get_subscribers_for_notification(
    db: Session,
    frequency: SubscriptionFrequency,
    job_ids: List[int]
) -> List[models.JobSubscription]:
    """
    Get active subscribers who should receive notifications for the given jobs
    """
    # Get subscribers with matching frequency
    query = db.query(models.JobSubscription).filter(
        models.JobSubscription.is_active == True,
        models.JobSubscription.frequency == frequency
    )
    
    # For instant notifications, send to all matching subscribers
    # For daily/weekly/monthly, only send if last_email_sent_at is past the interval
    if frequency == SubscriptionFrequency.INSTANT:
        # No time restriction for instant
        pass
    elif frequency == SubscriptionFrequency.DAILY:
        # Send if last email was sent more than 24 hours ago or never sent
        yesterday = datetime.utcnow() - timedelta(days=1)
        query = query.filter(
            (models.JobSubscription.last_email_sent_at == None) |
            (models.JobSubscription.last_email_sent_at < yesterday)
        )
    elif frequency == SubscriptionFrequency.WEEKLY:
        # Send if last email was sent more than 7 days ago or never sent
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(
            (models.JobSubscription.last_email_sent_at == None) |
            (models.JobSubscription.last_email_sent_at < week_ago)
        )
    elif frequency == SubscriptionFrequency.MONTHLY:
        # Send if last email was sent more than 30 days ago or never sent
        month_ago = datetime.utcnow() - timedelta(days=30)
        query = query.filter(
            (models.JobSubscription.last_email_sent_at == None) |
            (models.JobSubscription.last_email_sent_at < month_ago)
        )
    
    subscribers = query.all()
    
    # Filter subscribers based on their preferences and job matches
    matching_subscribers = []
    for subscriber in subscribers:
        # Get jobs that match subscriber preferences
        matching_jobs = get_matching_jobs_for_subscriber(db, subscriber, job_ids)
        if matching_jobs:
            matching_subscribers.append(subscriber)
    
    return matching_subscribers


def get_matching_jobs_for_subscriber(
    db: Session,
    subscriber: models.JobSubscription,
    job_ids: List[int]
) -> List[Job]:
    """
    Get jobs that match subscriber's preferences
    """
    query = db.query(Job).filter(
        Job.id.in_(job_ids),
        Job.is_active == True
    ).options(
        joinedload(Job.spa),
        joinedload(Job.city),
        joinedload(Job.state),
        joinedload(Job.job_category),
        joinedload(Job.job_type)
    )
    
    # Apply filters based on subscriber preferences
    if subscriber.city_id:
        query = query.filter(Job.city_id == subscriber.city_id)
    if subscriber.state_id:
        query = query.filter(Job.state_id == subscriber.state_id)
    if subscriber.job_category_id:
        query = query.filter(Job.job_category_id == subscriber.job_category_id)
    if subscriber.job_type_id:
        query = query.filter(Job.job_type_id == subscriber.job_type_id)
    
    return query.all()


async def send_notifications_for_jobs(
    db: Session,
    job_ids: List[int],
    frequency: SubscriptionFrequency = SubscriptionFrequency.INSTANT
):
    """
    Send email notifications to subscribers for new jobs
    """
    try:
        # Get matching subscribers
        subscribers = get_subscribers_for_notification(db, frequency, job_ids)
        
        if not subscribers:
            print(f"[NOTIFICATIONS] No subscribers found for frequency {frequency.value}")
            return
        
        # Get all jobs
        jobs = db.query(Job).filter(Job.id.in_(job_ids)).options(
            joinedload(Job.spa),
            joinedload(Job.city),
            joinedload(Job.state),
            joinedload(Job.job_category),
            joinedload(Job.job_type)
        ).all()
        
        if not jobs:
            print(f"[NOTIFICATIONS] No jobs found with IDs: {job_ids}")
            return
    except Exception as e:
        print(f"[NOTIFICATIONS] Error getting subscribers/jobs: {e}")
        return
    
    sent_count = 0
    failed_count = 0
    
    for subscriber in subscribers:
        # Get jobs matching this subscriber's preferences
        matching_jobs = get_matching_jobs_for_subscriber(db, subscriber, job_ids)
        
        if not matching_jobs:
            continue
        
        # Generate email content
        html_content = generate_job_email_html(
            matching_jobs,
            subscriber.name,
            subscriber.frequency.value
        )
        text_content = generate_job_email_text(
            matching_jobs,
            subscriber.name,
            subscriber.frequency.value
        )
        
        # Determine subject
        frequency_text = {
            "daily": "Daily",
            "weekly": "Weekly",
            "monthly": "Monthly",
            "instant": "New"
        }.get(subscriber.frequency.value, "New")
        
        subject = f"{frequency_text} Job Opportunities - {len(matching_jobs)} New Job{'s' if len(matching_jobs) != 1 else ''}"
        
        # Send email
        success = await send_email(
            to_email=subscriber.email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        # Log notification
        log_entry = models.EmailNotificationLog(
            subscription_id=subscriber.id,
            email=subscriber.email,
            subject=subject,
            job_ids=",".join(str(j.id) for j in matching_jobs),
            status="sent" if success else "failed",
            sent_at=datetime.utcnow()
        )
        db.add(log_entry)
        
        if success:
            # Update subscriber
            subscriber.last_email_sent_at = datetime.utcnow()
            subscriber.emails_sent_count = (subscriber.emails_sent_count or 0) + 1
            sent_count += 1
        else:
            failed_count += 1
    
    db.commit()
    
    print(f"[NOTIFICATIONS] Sent {sent_count} notifications, {failed_count} failed for {len(job_ids)} jobs")


async def send_digest_notifications(db: Session):
    """
    Send digest notifications (daily, weekly, monthly) for all active subscribers
    This should be called by a scheduled task/cron
    """
    # Get all new jobs from the last period
    now = datetime.utcnow()
    
    # For daily: last 24 hours
    daily_cutoff = now - timedelta(days=1)
    daily_jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.created_at >= daily_cutoff
    ).all()
    
    if daily_jobs:
        await send_notifications_for_jobs(
            db,
            [j.id for j in daily_jobs],
            SubscriptionFrequency.DAILY
        )
    
    # For weekly: last 7 days (only send once per week)
    weekly_cutoff = now - timedelta(days=7)
    weekly_jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.created_at >= weekly_cutoff
    ).all()
    
    if weekly_jobs:
        await send_notifications_for_jobs(
            db,
            [j.id for j in weekly_jobs],
            SubscriptionFrequency.WEEKLY
        )
    
    # For monthly: last 30 days (only send once per month)
    monthly_cutoff = now - timedelta(days=30)
    monthly_jobs = db.query(Job).filter(
        Job.is_active == True,
        Job.created_at >= monthly_cutoff
    ).all()
    
    if monthly_jobs:
        await send_notifications_for_jobs(
            db,
            [j.id for j in monthly_jobs],
            SubscriptionFrequency.MONTHLY
        )

