"""
Admin approval utilities
"""

from sqlalchemy.orm import Session
from app.modules.spas.models import Spa
from app.modules.jobs.models import Job


def approve_spa(db: Session, spa_id: int):
    """Approve a SPA"""
    spa = db.query(Spa).filter(Spa.id == spa_id).first()
    if spa:
        spa.is_verified = True
        db.commit()
        return spa
    return None


def approve_job(db: Session, job_id: int):
    """Approve/activate a job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job:
        job.is_active = True
        db.commit()
        return job
    return None

