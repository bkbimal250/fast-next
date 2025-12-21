"""
Application API routes
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Header
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.modules.applications import schemas
from app.modules.uploads.cv_storage import save_cv_file as save_cv_file_upload
from app.modules.jobs.models import JobApplication, Job
from app.modules.users.models import User, UserRole
from app.modules.users.routes import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("/", response_model=schemas.ApplicationResponse)
async def create_application(
    job_id: int = Form(...),
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    cv_file: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create a new job application.
    If user is logged in (Authorization header), uses their profile data. Otherwise requires manual entry.
    """
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            current_user = get_current_user(token, db)
        except:
            pass  # Allow anonymous applications
    
    cv_file_path = None
    if cv_file:
        cv_file_path = await save_cv_file_upload(cv_file)
    elif current_user and current_user.resume_path:
        # Use user's existing resume if available
        cv_file_path = current_user.resume_path
    
    # Use user profile data if logged in, otherwise use provided data
    if current_user:
        application = JobApplication(
            job_id=job_id,
            user_id=current_user.id,
            name=name or current_user.name,
            phone=phone or current_user.phone,
            email=email or current_user.email,
            experience=experience,
            location=location or (f"{current_user.city_id}" if current_user.city_id else None),
            cv_file_path=cv_file_path
        )
    else:
        # Anonymous application - all fields required
        if not all([name, phone, email]):
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Name, phone, and email are required for anonymous applications")
        
        application = JobApplication(
            job_id=job_id,
            name=name,
            phone=phone,
            email=email,
            experience=experience,
            location=location,
            cv_file_path=cv_file_path
        )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return application


@router.get("/recruiter/my-applications", response_model=List[schemas.ApplicationResponse])
def get_my_applications(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get applications for jobs posted by the recruiter (only for their managed SPA)"""
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can access this endpoint")
    
    if not current_user.managed_spa_id:
        raise HTTPException(status_code=404, detail="You don't have a managed SPA yet")
    
    # Get all jobs for the recruiter's SPA
    job_ids = [job.id for job in db.query(Job.id).filter(Job.spa_id == current_user.managed_spa_id).all()]
    
    if not job_ids:
        return []
    
    # Get applications for those jobs with job relationship loaded
    applications = db.query(JobApplication).options(
        joinedload(JobApplication.job)
    ).filter(
        JobApplication.job_id.in_(job_ids)
    ).order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()
    
    return applications


@router.get("/", response_model=List[schemas.ApplicationResponse])
def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    job_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get applications with optional authentication.
    - If authenticated as admin/manager: returns all applications with filters
    - If authenticated as recruiter: returns applications for their SPA's jobs
    - If not authenticated: returns only count (if job_id provided) or empty list
    """
    query = db.query(JobApplication)
    
    # Apply filters
    if job_id:
        query = query.filter(JobApplication.job_id == job_id)
    if user_id:
        query = query.filter(JobApplication.user_id == user_id)
    if status:
        query = query.filter(JobApplication.status == status)
    
    # If not authenticated, only return count (for public job detail pages)
    if current_user is None:
        if job_id:
            # Return minimal data for count - just return count in response
            count = query.count()
            return []  # Return empty list but frontend can use count from headers or separate endpoint
        else:
            # No job_id and not authenticated - return empty
            return []
    
    # Authenticated users - check permissions
    if current_user.role == UserRole.RECRUITER:
        # Recruiters can only see applications for their SPA's jobs
        if not current_user.managed_spa_id:
            return []
        job_ids = [job.id for job in db.query(Job.id).filter(Job.spa_id == current_user.managed_spa_id).all()]
        if not job_ids:
            return []
        query = query.filter(JobApplication.job_id.in_(job_ids))
    elif current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        # Other roles (or no role) - return empty
        return []
    
    applications = query.options(
        joinedload(JobApplication.job)
    ).order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()
    return applications


@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application by ID"""
    application = db.query(JobApplication).options(
        joinedload(JobApplication.job)
    ).filter(JobApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if current_user.role == UserRole.RECRUITER:
        # Recruiters can only view applications for their jobs
        if not current_user.managed_spa_id:
            raise HTTPException(status_code=403, detail="You don't have a managed SPA")
        job = db.query(Job).filter(Job.id == application.job_id).first()
        if not job or job.spa_id != current_user.managed_spa_id:
            raise HTTPException(status_code=403, detail="You don't have permission to view this application")
    
    return application


@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(
    application_id: int,
    update_data: schemas.ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application (status, etc.)"""
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if current_user.role == UserRole.RECRUITER:
        # Recruiters can only update applications for their jobs
        if not current_user.managed_spa_id:
            raise HTTPException(status_code=403, detail="You don't have a managed SPA")
        job = db.query(Job).filter(Job.id == application.job_id).first()
        if not job or job.spa_id != current_user.managed_spa_id:
            raise HTTPException(status_code=403, detail="You don't have permission to update this application")
    
    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete application (admin/manager only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Only admins and managers can delete applications")
    
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}

