"""
Script to create an admin user
Usage: python create_admin.py
"""

import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.modules.users.models import User, UserRole, Permission
from app.core.security import get_password_hash
from app.modules.users.services import create_default_permissions


def create_admin_user():
    """Create admin user with specified credentials"""
    
    # Initialize database
    init_db()
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_user = db.query(User).filter(
            User.email == "bkbimal250@gmail.com"
        ).first()
        
        if existing_user:
            print(f"User with email 'bkbimal250@gmail.com' already exists!")
            print(f"Updating to admin role and password...")
            existing_user.role = UserRole.ADMIN
            existing_user.name = "bimal Vishwakarma"  # Update name
            existing_user.hashed_password = get_password_hash("Dos@2026")  # Update password
            existing_user.is_active = True
            existing_user.is_verified = True
            db.commit()
            
            # Update or create admin permissions
            existing_permission = db.query(Permission).filter(
                Permission.user_id == existing_user.id
            ).first()
            
            if existing_permission:
                # Update existing permissions
                existing_permission.can_post_jobs = True
                existing_permission.can_post_free_jobs = True
                existing_permission.can_post_premium_jobs = True
                existing_permission.can_create_spa = True
                existing_permission.can_edit_spa = True
                existing_permission.can_manage_users = True
                existing_permission.can_manage_all_jobs = True
                existing_permission.can_manage_all_spas = True
            else:
                # Create new permissions
                admin_permission = Permission(
                    user_id=existing_user.id,
                    can_post_jobs=True,
                    can_post_free_jobs=True,
                    can_post_premium_jobs=True,
                    can_create_spa=True,
                    can_edit_spa=True,
                    can_manage_users=True,
                    can_manage_all_jobs=True,
                    can_manage_all_spas=True
                )
                db.add(admin_permission)
            
            db.commit()
            print(f"[OK] User updated to ADMIN role successfully!")
            print(f"[OK] Admin permissions updated/created successfully!")
            return
        
        # Create new admin user
        admin_user = User(
            name="bimal Vishwakarma",
            email="dos.bimal@gmail.com",
            phone="",  # Placeholder phone, can be updated later
            hashed_password=get_password_hash("Dos@2026"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"[OK] Admin user created successfully!")
        print(f"  Name: {admin_user.name}")
        print(f"  Email: {admin_user.email}")
        print(f"  Role: {admin_user.role.value}")
        print(f"  ID: {admin_user.id}")
        
        # Create admin permissions
        admin_permission = Permission(
            user_id=admin_user.id,
            can_post_jobs=True,
            can_post_free_jobs=True,
            can_post_premium_jobs=True,
            can_create_spa=True,
            can_edit_spa=True,
            can_manage_users=True,
            can_manage_all_jobs=True,
            can_manage_all_spas=True
        )
        
        db.add(admin_permission)
        db.commit()
        
        print(f"[OK] Admin permissions created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error creating admin user: {str(e)}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    print("Creating admin user...")
    print("=" * 50)
    create_admin_user()
    print("=" * 50)
    print("Done!")

