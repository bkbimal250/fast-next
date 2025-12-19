"""
SPA business logic
"""

from sqlalchemy.orm import Session
from app.modules.spas import models, schemas
from app.core.config import settings
from app.utils.geo_utils import calculate_distance
from typing import List, Optional


def get_spa_by_slug(db: Session, slug: str):
    """Get SPA by slug"""
    return db.query(models.Spa).filter(models.Spa.slug == slug).first()


def get_spa_by_id(db: Session, spa_id: int):
    """Get SPA by ID"""
    return db.query(models.Spa).filter(models.Spa.id == spa_id).first()


def get_spas(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None, created_by: Optional[int] = None):
    """Get all SPAs with optional filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        is_active: Filter by active status
        created_by: Filter by creator user ID (for managers/admins to see only their SPAs)
    """
    query = db.query(models.Spa)
    
    if is_active is not None:
        query = query.filter(models.Spa.is_active == is_active)
    
    if created_by is not None:
        query = query.filter(models.Spa.created_by == created_by)
    
    return query.offset(skip).limit(limit).all()


def create_spa(db: Session, spa_data: schemas.SpaCreate, user_id: int, is_recruiter: bool = False):
    """Create a new SPA
    
    Args:
        db: Database session
        spa_data: SPA creation data
        user_id: ID of user creating the SPA
        is_recruiter: If True, this SPA will be set as the recruiter's managed_spa
    """
    from app.modules.users.models import User
    
    spa_dict = spa_data.dict(exclude={'spa_images'})
    spa_images = spa_data.spa_images
    
    db_spa = models.Spa(
        **spa_dict,
        spa_images=spa_images,
        created_by=user_id,
        updated_by=user_id
    )
    
    db.add(db_spa)
    db.flush()  # Flush to get the spa.id
    
    # If recruiter, set this as their managed_spa
    if is_recruiter:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Check if recruiter already has a managed_spa
            if user.managed_spa_id is not None:
                raise ValueError("Recruiter can only manage one SPA. Please update your existing SPA instead.")
            user.managed_spa_id = db_spa.id
    
    db.commit()
    db.refresh(db_spa)
    return db_spa


def update_spa(db: Session, spa_id: int, spa_data: schemas.SpaUpdate, user_id: int):
    """Update an existing SPA"""
    spa = get_spa_by_id(db, spa_id)
    if not spa:
        return None
    
    update_data = spa_data.dict(exclude_unset=True, exclude={'spa_images'})
    for field, value in update_data.items():
        setattr(spa, field, value)
    
    # Handle spa_images separately
    if 'spa_images' in spa_data.dict(exclude_unset=True):
        spa.spa_images = spa_data.spa_images
    
    spa.updated_by = user_id
    db.commit()
    db.refresh(spa)
    return spa


def delete_spa(db: Session, spa_id: int):
    """Delete a SPA (soft delete by setting is_active=False)"""
    spa = get_spa_by_id(db, spa_id)
    if not spa:
        return False
    
    spa.is_active = False
    db.commit()
    return True


def get_spas_near_location(db: Session, latitude: float, longitude: float, radius_km: float = 10):
    """Get SPAs near a location"""
    # Get all active SPAs with coordinates
    spas = db.query(models.Spa).filter(
        models.Spa.is_active == True,
        models.Spa.latitude.isnot(None),
        models.Spa.longitude.isnot(None)
    ).all()
    
    # Filter by distance (works for both SQLite and PostgreSQL)
    nearby_spas = []
    for spa in spas:
        if spa.latitude and spa.longitude:
            distance = calculate_distance(latitude, longitude, spa.latitude, spa.longitude)
            if distance <= radius_km:
                nearby_spas.append(spa)
    
    return nearby_spas


def get_recruiter_spa(db: Session, user_id: int):
    """Get the SPA managed by a recruiter"""
    from app.modules.users.models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.managed_spa_id:
        return None
    return get_spa_by_id(db, user.managed_spa_id)

