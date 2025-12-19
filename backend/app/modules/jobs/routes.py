"""
Job API routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.modules.jobs import schemas, services
from app.modules.users.routes import get_current_user, require_role
from app.modules.users.models import User, UserRole

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


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

    Frontend can call this when the Apply button is clicked.
    """
    job = services.increment_job_apply_click(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "ok", "apply_click_count": job.apply_click_count}


@router.post("/{job_id}/track-message")
def track_job_message(job_id: int, db: Session = Depends(get_db)):
    """
    Increment message_count for a job.

    Frontend can call this when a message is sent for this job.
    """
    job = services.increment_job_message_count(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "ok", "message_count": job.message_count}


@router.post("/", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job: schemas.JobCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER])),
    db: Session = Depends(get_db)
):
    """Create a new job (admin/manager/recruiter only - recruiters can only post on their own SPA)"""
    try:
        return services.create_job(db, job, current_user.id, user_role=current_user.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{job_id}", response_model=schemas.JobResponse)
def update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER])),
    db: Session = Depends(get_db)
):
    """Update a job (admin/manager/recruiter only - recruiters can only update jobs on their own SPA)"""
    try:
        updated = services.update_job(db, job_id, job_update, current_user.id, user_role=current_user.role)
        if not updated:
            raise HTTPException(status_code=404, detail="Job not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete a job (admin only)"""
    deleted = services.delete_job(db, job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found")
    return None


# Recruiter-specific endpoints
@router.get("/recruiter/my-jobs", response_model=list[schemas.JobResponse])
def get_my_jobs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role([UserRole.RECRUITER])),
    db: Session = Depends(get_db)
):
    """Get jobs for the recruiter's managed SPA"""
    return services.get_recruiter_jobs(db, current_user.id, skip=skip, limit=limit)


@router.get("/popular", response_model=list[schemas.JobResponse])
def get_popular_jobs(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get most popular jobs ordered by view_count (and apply clicks).
    Ideal for 'Popular Jobs' sections on the frontend.
    """
    return services.get_popular_jobs(db, limit=limit)


@router.get("/stats/by-state")
def job_stats_by_state(db: Session = Depends(get_db)):
    """Get total jobs grouped by state_id (for state-level filters)."""
    return services.get_job_counts_by_state(db)


@router.get("/stats/by-city")
def job_stats_by_city(db: Session = Depends(get_db)):
    """Get total jobs grouped by city_id (for city-level filters)."""
    return services.get_job_counts_by_city(db)


@router.get("/stats/by-area")
def job_stats_by_area(db: Session = Depends(get_db)):
    """Get total jobs grouped by area_id (for area-level filters)."""
    return services.get_job_counts_by_area(db)


# JobType Routes
@router.get("/types", response_model=List[schemas.JobTypeResponse])
def get_job_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all job types"""
    return services.get_all_job_types(db, skip=skip, limit=limit)


@router.post("/types", response_model=schemas.JobTypeResponse, status_code=status.HTTP_201_CREATED)
def create_job_type(
    job_type: schemas.JobTypeCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Create a new job type (admin/manager only)"""
    return services.create_job_type(db, job_type)


@router.put("/types/{job_type_id}", response_model=schemas.JobTypeResponse)
def update_job_type(
    job_type_id: int,
    job_type_update: schemas.JobTypeUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Update a job type (admin/manager only)"""
    updated = services.update_job_type(db, job_type_id, job_type_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Job type not found")
    return updated


@router.delete("/types/{job_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_type(
    job_type_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete a job type (admin only)"""
    deleted = services.delete_job_type(db, job_type_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job type not found")
    return None


# JobCategory Routes
@router.get("/categories", response_model=List[schemas.JobCategoryResponse])
def get_job_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all job categories"""
    return services.get_all_job_categories(db, skip=skip, limit=limit)


@router.post("/categories", response_model=schemas.JobCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_job_category(
    job_category: schemas.JobCategoryCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Create a new job category (admin/manager only)"""
    return services.create_job_category(db, job_category)


@router.put("/categories/{job_category_id}", response_model=schemas.JobCategoryResponse)
def update_job_category(
    job_category_id: int,
    job_category_update: schemas.JobCategoryUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Update a job category (admin/manager only)"""
    updated = services.update_job_category(db, job_category_id, job_category_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Job category not found")
    return updated


@router.delete("/categories/{job_category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_category(
    job_category_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete a job category (admin only)"""
    deleted = services.delete_job_category(db, job_category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job category not found")
    return None

