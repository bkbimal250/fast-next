"""
User business logic: authentication, profile management, permissions
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List
from app.modules.users import models, schemas
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.modules.users.models import UserRole

# Ensure all related models are imported to resolve relationships
# This is necessary for SQLAlchemy to properly configure relationships
try:
    from app.modules.spas import models as spa_models  # noqa: F401
    from app.modules.jobs import models as job_models  # noqa: F401
    from app.modules.locations import models as location_models  # noqa: F401
except ImportError:
    pass  # Models may not be available in all contexts


def create_user(db: Session, user_data: schemas.UserRegister) -> models.User:
    """Create a new user with default USER role"""
    hashed_password = get_password_hash(user_data.password)
    
    db_user = models.User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hashed_password,
        role=UserRole.USER  # Default role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default permissions for user
    create_default_permissions(db, db_user.id)
    
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> models.User | None:
    """Authenticate user by email and password"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        return None
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user


def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> models.User | None:
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()


def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserUpdate) -> models.User:
    """Update user profile"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def update_user_resume(db: Session, user_id: int, resume_path: str) -> models.User:
    """Update user resume file path"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.resume_path = resume_path
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def update_user_photo(db: Session, user_id: int, photo_path: str) -> models.User:
    """Update user profile photo path"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.profile_photo = photo_path
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: int, current_password: str, new_password: str) -> bool:
    """Change user password"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    if not verify_password(current_password, user.hashed_password):
        return False
    
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    db.commit()
    return True


def create_default_permissions(db: Session, user_id: int):
    """Create default permissions for a user based on their role"""
    user = get_user_by_id(db, user_id)
    if not user:
        return
    
    permission = models.Permission(user_id=user_id)
    
    # Set permissions based on role
    if user.role == UserRole.ADMIN:
        permission.can_post_jobs = True
        permission.can_post_free_jobs = True
        permission.can_post_premium_jobs = True
        permission.can_create_spa = True
        permission.can_edit_spa = True
        permission.can_manage_users = True
        permission.can_manage_all_jobs = True
        permission.can_manage_all_spas = True
    elif user.role == UserRole.MANAGER:
        permission.can_post_jobs = True
        permission.can_post_free_jobs = True
        permission.can_post_premium_jobs = True
        permission.can_create_spa = True
        permission.can_edit_spa = True
    elif user.role == UserRole.RECRUITER:
        permission.can_post_jobs = False  # Recruiters don't post jobs directly
        permission.can_edit_spa = True  # Can manage their own spa
    # USER role: all False (default)
    
    db.add(permission)
    db.commit()


def get_user_permissions(db: Session, user_id: int) -> models.Permission | None:
    """Get user permissions"""
    return db.query(models.Permission).filter(models.Permission.user_id == user_id).first()


def check_permission(db: Session, user_id: int, permission_name: str) -> bool:
    """Check if user has a specific permission"""
    permission = get_user_permissions(db, user_id)
    if not permission:
        return False
    
    return getattr(permission, permission_name, False)


def can_create_job(db: Session, user_id: int) -> bool:
    """Check if user can create jobs (Manager or Admin)"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    return user.role in [UserRole.MANAGER, UserRole.ADMIN]


def can_create_spa(db: Session, user_id: int) -> bool:
    """Check if user can create spas (Manager or Admin)"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    return user.role in [UserRole.MANAGER, UserRole.ADMIN]


def get_user_applications(db: Session, user_id: int):
    """Get all job applications for a user"""
    from app.modules.jobs.models import JobApplication
    return db.query(JobApplication).filter(JobApplication.user_id == user_id).order_by(
        JobApplication.created_at.desc()
    ).all()


def generate_password_reset_token(db: Session, email: str) -> str | None:
    """Generate password reset token for user"""
    user = get_user_by_email(db, email)
    if not user:
        return None  # Don't reveal if email exists
    
    import secrets
    from datetime import timedelta
    
    # Generate secure random token
    token = secrets.token_urlsafe(32)
    
    # Create reset token record
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    )
    
    db.add(reset_token)
    db.commit()
    
    return token


def verify_password_reset_token(db: Session, token: str) -> models.User | None:
    """Verify password reset token and return user if valid"""
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.is_used == False,
        models.PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        return None
    
    return reset_token.user


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Reset user password using reset token"""
    user = verify_password_reset_token(db, token)
    if not user:
        return False
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    
    # Mark token as used
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token
    ).first()
    if reset_token:
        reset_token.is_used = True
    
    db.commit()
    return True


# Admin User Management
def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get all users (admin only)"""
    return db.query(models.User).order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()


def create_user_by_admin(db: Session, user_data: schemas.AdminUserCreate) -> models.User:
    """Create a new user by admin (with role assignment)"""
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        raise ValueError("Email already registered")
    
    # Check if phone already exists
    existing_phone = db.query(models.User).filter(models.User.phone == user_data.phone).first()
    if existing_phone:
        raise ValueError("Phone number already registered")
    
    hashed_password = get_password_hash(user_data.password)
    
    user_dict = user_data.dict(exclude={'password'})
    user_dict['hashed_password'] = hashed_password
    user_dict['role'] = user_dict.get('role') or UserRole.USER
    user_dict['is_active'] = user_dict.get('is_active', True)
    user_dict['is_verified'] = user_dict.get('is_verified', False)
    
    db_user = models.User(**user_dict)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default permissions for user
    create_default_permissions(db, db_user.id)
    
    return db_user


def update_user_by_admin(db: Session, user_id: int, user_data: schemas.AdminUserUpdate) -> models.User | None:
    """Update user by admin (includes role and status changes)"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_data.dict(exclude_unset=True)
    
    # Check email uniqueness if email is being updated
    if 'email' in update_data and update_data['email'] != user.email:
        existing_user = get_user_by_email(db, update_data['email'])
        if existing_user and existing_user.id != user_id:
            raise ValueError("Email already registered")
    
    # Check phone uniqueness if phone is being updated
    if 'phone' in update_data and update_data['phone'] != user.phone:
        existing_phone = db.query(models.User).filter(
            models.User.phone == update_data['phone'],
            models.User.id != user_id
        ).first()
        if existing_phone:
            raise ValueError("Phone number already registered")
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    
    # If role changed, update permissions
    if 'role' in update_data:
        permission = get_user_permissions(db, user_id)
        if permission:
            db.delete(permission)
            db.commit()
        create_default_permissions(db, user_id)
    
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete a user (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    # Soft delete: set is_active to False instead of actually deleting
    # This preserves data integrity for relationships
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    return True