"""
Job API routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.modules.jobs import schemas, services
from app.modules.jobs.models import Job, JobCategory, JobType
from app.modules.locations.models import City, State, Area
from app.modules.users.routes import get_current_user, require_role
from app.modules.users.models import User, UserRole

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/types")
def get_job_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get all job types.
    Used by frontend for dropdowns and filters.
    """
    job_types = db.query(JobType).offset(skip).limit(limit).all()
    return [
        {
            "id": job_type.id,
            "name": job_type.name,
            "slug": job_type.slug,
            "description": job_type.description,
        }
        for job_type in job_types
    ]


@router.get("/categories")
def get_job_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get all job categories.
    Used by frontend for dropdowns and filters.
    """
    job_categories = db.query(JobCategory).offset(skip).limit(limit).all()
    return [
        {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
        }
        for category in job_categories
    ]


@router.get("/", response_model=list[schemas.JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    country_id: int | None = None,
    state_id: int | None = None,
    city_id: int | None = None,
    area_id: int | None = None,
    spa_id: int | None = None,
    job_type: str | None = None,
    job_category: str | None = None,
    is_featured: bool | None = None,
    db: Session = Depends(get_db),
):
    """
    Get all active jobs with optional filters.

    Frontend can filter by country, state, city, area, spa, job type,
    job category, and featured flag.
    
    Note: Caching is handled at the service layer for better performance.
    """
    return services.get_jobs(
        db=db,
        skip=skip,
        limit=limit,
        country_id=country_id,
        state_id=state_id,
        city_id=city_id,
        area_id=area_id,
        spa_id=spa_id,
        job_type=job_type,
        job_category=job_category,
        is_featured=is_featured,
    )


@router.get("/count")
def get_job_count(
    country_id: int | None = None,
    state_id: int | None = None,
    city_id: int | None = None,
    area_id: int | None = None,
    job_type: str | None = None,
    job_category: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get count of active jobs with optional filters.
    Useful for displaying job counts in search results and location pages.
    """
    query = db.query(Job).filter(Job.is_active == True)
    
    if country_id:
        query = query.filter(Job.country_id == country_id)
    if state_id:
        query = query.filter(Job.state_id == state_id)
    if city_id:
        query = query.filter(Job.city_id == city_id)
    if area_id:
        query = query.filter(Job.area_id == area_id)
    if job_type:
        if isinstance(job_type, str):
            query = query.join(JobType).filter(JobType.name == job_type)
        else:
            query = query.filter(Job.job_type_id == job_type)
    if job_category:
        if isinstance(job_category, str):
            query = query.join(JobCategory).filter(JobCategory.name == job_category)
        else:
            query = query.filter(Job.job_category_id == job_category)
    
    count = query.count()
    return {"count": count}


@router.get("/counts-by-location")
def get_job_counts_by_location(
    job_category: str | None = None,
    job_type: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get job counts grouped by location (city).
    Returns list of cities with their job counts.
    Useful for location-based job listing pages.
    """
    query = db.query(
        City.id,
        City.name,
        City.slug,
        func.count(Job.id).label('job_count')
    ).join(
        Job, City.id == Job.city_id
    ).filter(
        Job.is_active == True
    )
    
    if job_category:
        query = query.join(JobCategory).filter(JobCategory.name == job_category)
    if job_type:
        query = query.join(JobType).filter(JobType.name == job_type)
    
    results = query.group_by(City.id, City.name, City.slug).all()
    
    return [
        {
            "city_id": city_id,
            "city_name": city_name,
            "city_slug": city_slug,
            "job_count": job_count
        }
        for city_id, city_name, city_slug, job_count in results
    ]


@router.get("/id/{job_id}", response_model=schemas.JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    """Get job by ID"""
    job = services.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/slug/{slug}", response_model=schemas.JobResponse)
def get_job_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get job by slug"""
    job = services.get_job_by_slug(db, slug)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/near-me")
def get_jobs_near_me(
    latitude: float,
    longitude: float,
    radius_km: float = 10,
    db: Session = Depends(get_db)
):
    """Get jobs near a location."""
    from app.modules.jobs.geo import get_jobs_near_location
    return get_jobs_near_location(db, latitude, longitude, radius_km)


@router.post("/{job_id}/track-view")
def track_job_view(job_id: int, db: Session = Depends(get_db)):
    """
    Increment view_count for a job.

    Frontend can call this when a job detail page is viewed.
    """
    job = services.increment_job_view(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "ok", "view_count": job.view_count}


@router.post("/{job_id}/track-apply-click")
def track_job_apply_click(job_id: int, db: Session = Depends(get_db)):
    """
    Increment apply_click_count for a job.

    Frontend can call this when user clicks apply button.
    """
    job = services.increment_job_apply_click(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "ok", "apply_click_count": job.apply_click_count}


@router.get("/popular")
def get_popular_jobs(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get popular jobs sorted by view_count.
    """
    jobs = db.query(Job).filter(
        Job.is_active == True
    ).order_by(
        Job.view_count.desc()
    ).limit(limit).all()
    
    return [schemas.JobResponse.model_validate(job) for job in jobs]


@router.post("/", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job posting.
    
    Only authenticated users can create jobs.
    """
    return services.create_job(db, job, current_user.id)


@router.put("/{job_id}", response_model=schemas.JobResponse)
def update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a job posting.
    
    Only the job creator or admin can update.
    """
    job = services.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check permissions
    if job.created_by != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )
    
    return services.update_job(db, job_id, job_update)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a job posting.
    
    Only the job creator or admin can delete.
    """
    job = services.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check permissions
    if job.created_by != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )
    
    services.delete_job(db, job_id)
    return None
