"""
Application API routes
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Header
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.applications import schemas
from app.modules.uploads.cv_storage import save_cv_file as save_cv_file_upload
from app.modules.jobs.models import JobApplication, Job
from app.modules.users.models import User, UserRole
from app.modules.users.routes import get_current_user

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
    
    # Get applications for those jobs
    applications = db.query(JobApplication).filter(
        JobApplication.job_id.in_(job_ids)
    ).order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()
    
    return applications

