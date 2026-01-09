"""
Subscription API routes
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
from app.core.database import get_db
from app.modules.subscribe import schemas, models
from app.modules.subscribe.models import SubscriptionFrequency
from app.modules.subscribe.email_service import send_email, generate_job_email_html, generate_job_email_text
from app.modules.subscribe.utils import generate_unsubscribe_token
from app.modules.users.routes import get_current_user_optional
from app.modules.users.models import User
from app.modules.jobs.models import Job
from app.core.config import settings

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.post("/", response_model=schemas.SubscriptionResponse, status_code=201)
async def create_subscription(
    subscription: schemas.SubscriptionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Subscribe to job email notifications.
    Can be used by logged-in users or anonymous users with email.
    """
    # Check if subscription already exists for this email
    existing = db.query(models.JobSubscription).filter(
        models.JobSubscription.email == subscription.email.lower()
    ).first()
    
    if existing:
        if existing.is_active:
            raise HTTPException(
                status_code=400,
                detail="Email is already subscribed. Use update endpoint to modify preferences."
            )
        else:
            # Reactivate existing subscription
            existing.is_active = True
            existing.frequency = subscription.frequency
            existing.name = subscription.name or existing.name
            existing.city_id = subscription.city_id
            existing.state_id = subscription.state_id
            existing.job_category_id = subscription.job_category_id
            existing.job_type_id = subscription.job_type_id
            existing.unsubscribed_at = None
            existing.user_id = current_user.id if current_user else existing.user_id
            if not existing.unsubscribe_token:
                existing.unsubscribe_token = generate_unsubscribe_token()
            
            db.commit()
            db.refresh(existing)
            
            # Send welcome email in background
            def send_welcome_sync():
                asyncio.run(send_welcome_email(existing.email, existing.name, existing.unsubscribe_token))
            background_tasks.add_task(send_welcome_sync)
            
            return existing
    
    # Create new subscription
    db_subscription = models.JobSubscription(
        email=subscription.email.lower(),
        name=subscription.name,
        frequency=subscription.frequency,
        city_id=subscription.city_id,
        state_id=subscription.state_id,
        job_category_id=subscription.job_category_id,
        job_type_id=subscription.job_type_id,
        user_id=current_user.id if current_user else None,
        unsubscribe_token=generate_unsubscribe_token(),
        is_active=True
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Send welcome email in background
    def send_welcome_sync():
        asyncio.run(send_welcome_email(db_subscription.email, db_subscription.name, db_subscription.unsubscribe_token))
    background_tasks.add_task(send_welcome_sync)
    
    return db_subscription


@router.get("/", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    email: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get subscriptions. If user is logged in, returns their subscriptions.
    Otherwise requires email parameter.
    """
    query = db.query(models.JobSubscription)
    
    if current_user:
        query = query.filter(models.JobSubscription.user_id == current_user.id)
    elif email:
        query = query.filter(models.JobSubscription.email == email.lower())
    else:
        raise HTTPException(
            status_code=400,
            detail="Either login or provide email parameter"
        )
    
    subscriptions = query.order_by(models.JobSubscription.created_at.desc()).offset(skip).limit(limit).all()
    return subscriptions


@router.put("/{subscription_id}", response_model=schemas.SubscriptionResponse)
def update_subscription(
    subscription_id: int,
    update_data: schemas.SubscriptionUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Update subscription preferences
    """
    subscription = db.query(models.JobSubscription).filter(
        models.JobSubscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check permission
    if current_user and subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this subscription")
    
    # Update fields
    if update_data.frequency is not None:
        subscription.frequency = update_data.frequency
    if update_data.is_active is not None:
        subscription.is_active = update_data.is_active
        if not update_data.is_active:
            subscription.unsubscribed_at = datetime.utcnow()
        else:
            subscription.unsubscribed_at = None
    if update_data.city_id is not None:
        subscription.city_id = update_data.city_id
    if update_data.state_id is not None:
        subscription.state_id = update_data.state_id
    if update_data.job_category_id is not None:
        subscription.job_category_id = update_data.job_category_id
    if update_data.job_type_id is not None:
        subscription.job_type_id = update_data.job_type_id
    
    db.commit()
    db.refresh(subscription)
    
    return subscription


@router.post("/unsubscribe", response_model=schemas.UnsubscribeResponse)
def unsubscribe(
    unsubscribe_data: schemas.UnsubscribeRequest,
    db: Session = Depends(get_db)
):
    """
    Unsubscribe using token (from email link)
    """
    subscription = db.query(models.JobSubscription).filter(
        models.JobSubscription.unsubscribe_token == unsubscribe_data.token
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Invalid unsubscribe token")
    
    subscription.is_active = False
    subscription.unsubscribed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "success": True,
        "message": "Successfully unsubscribed from job notifications"
    }


@router.delete("/{subscription_id}", status_code=204)
def delete_subscription(
    subscription_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Delete subscription
    """
    subscription = db.query(models.JobSubscription).filter(
        models.JobSubscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check permission
    if current_user and subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this subscription")
    
    db.delete(subscription)
    db.commit()
    
    return None


async def send_welcome_email(email: str, name: Optional[str], unsubscribe_token: str):
    """Send welcome email to new subscriber"""
    site_url = settings.SITE_URL or "http://localhost:3000"
    unsubscribe_url = f"{site_url}/unsubscribe?token={unsubscribe_token}"
    
    greeting = f"Hello {name}," if name else "Hello,"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to Job Notifications</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-top: 0;">Welcome to Job Notifications!</h1>
            <p>{greeting}</p>
            <p>Thank you for subscribing to our job notifications. You'll receive regular updates about new job opportunities that match your preferences.</p>
            <p>You can manage your subscription preferences or unsubscribe at any time.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 11px;">
                    <a href="{unsubscribe_url}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
{greeting}

Thank you for subscribing to our job notifications. You'll receive regular updates about new job opportunities that match your preferences.

You can manage your subscription preferences or unsubscribe at any time.

Unsubscribe: {unsubscribe_url}
"""
    
    await send_email(
        to_email=email,
        subject="Welcome to Job Notifications - Work Spa",
        html_content=html_content,
        text_content=text_content
    )

