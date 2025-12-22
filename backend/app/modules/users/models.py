"""
User models with roles and permissions
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles with different permissions"""
    USER = "user"  # Default: Can apply, view history, update profile
    MANAGER = "manager"  # Can add spas, create jobs on existing spas
    ADMIN = "admin"  # Full access: create spas, jobs, manage everything
    RECRUITER = "recruiter"  # Can create profiles, manage one business


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile
    name = Column(String(255), nullable=False)
    profile_photo = Column(String(255), nullable=True)  # Path to uploaded photo
    resume_path = Column(String(255), nullable=True)  # Path to uploaded resume
    
    # Role & Permissions
    role = Column(Enum(UserRole), default=UserRole.USER, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Additional profile info
    bio = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    created_spas = relationship("Spa", foreign_keys="Spa.created_by", back_populates="created_by_user")
    updated_spas = relationship("Spa", foreign_keys="Spa.updated_by", back_populates="updated_by_user")
    created_jobs = relationship("Job", foreign_keys="Job.created_by", back_populates="created_by_user")
    updated_jobs = relationship("Job", foreign_keys="Job.updated_by", back_populates="updated_by_user")
    applications = relationship("JobApplication", back_populates="user")
    country = relationship("Country", back_populates="users")
    state = relationship("State", back_populates="users")
    city = relationship("City", back_populates="users")
    subscriptions = relationship("JobSubscription", back_populates="user")
    
    # Recruiter: Can have one business (spa)
    managed_spa_id = Column(Integer, ForeignKey("spas.id"), nullable=True, index=True)
    managed_spa = relationship("Spa", foreign_keys=[managed_spa_id])


class Permission(Base):
    """Permission system for future free listing and advanced access control"""
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Job posting permissions
    can_post_jobs = Column(Boolean, default=False)
    can_post_free_jobs = Column(Boolean, default=False)  # Future: free listing
    can_post_premium_jobs = Column(Boolean, default=False)
    
    # Spa management
    can_create_spa = Column(Boolean, default=False)
    can_edit_spa = Column(Boolean, default=False)
    
    # Admin permissions
    can_manage_users = Column(Boolean, default=False)
    can_manage_all_jobs = Column(Boolean, default=False)
    can_manage_all_spas = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")


class UserSession(Base):
    """Track user sessions for security"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    token = Column(String, unique=True, index=True)
    ip_address = Column(String)
    user_agent = Column(String)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")


class PasswordResetToken(Base):
    """Password reset tokens for forgot password functionality"""
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

