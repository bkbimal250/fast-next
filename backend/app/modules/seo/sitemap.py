"""
Sitemap generation
"""

from fastapi import Response
from sqlalchemy.orm import Session
from app.modules.jobs.models import Job
from app.modules.spas.models import Spa
from app.modules.locations.models import City
from app.core.config import settings


def generate_sitemap(db: Session) -> str:
    """Generate XML sitemap"""
    base_url = settings.SITE_URL
    
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Homepage
    sitemap.append(f'  <url><loc>{base_url}</loc><priority>1.0</priority></url>')
    
    # Cities
    cities = db.query(City).all()
    for city in cities:
        sitemap.append(f'  <url><loc>{base_url}/cities/{city.slug}</loc><priority>0.8</priority></url>')
    
    # SPAs
    spas = db.query(Spa).filter(Spa.is_active == True).all()
    for spa in spas:
        sitemap.append(f'  <url><loc>{base_url}/spas/{spa.slug}</loc><priority>0.7</priority></url>')
    
    # Jobs
    jobs = db.query(Job).filter(Job.is_active == True).all()
    for job in jobs:
        sitemap.append(f'  <url><loc>{base_url}/jobs/{job.slug}</loc><priority>0.9</priority></url>')
    
    sitemap.append('</urlset>')
    
    return '\n'.join(sitemap)

