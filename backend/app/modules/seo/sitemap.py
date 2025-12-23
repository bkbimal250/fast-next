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
    from datetime import datetime
    
    base_url = settings.SITE_URL
    today = datetime.utcnow().strftime('%Y-%m-%d')
    
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Homepage
    sitemap.append(f'  <url>')
    sitemap.append(f'    <loc>{base_url}</loc>')
    sitemap.append(f'    <lastmod>{today}</lastmod>')
    sitemap.append(f'    <changefreq>daily</changefreq>')
    sitemap.append(f'    <priority>1.0</priority>')
    sitemap.append(f'  </url>')
    
    # Main pages
    main_pages = [
        ('/jobs', 'daily', '0.9'),
        ('/spa-near-me', 'weekly', '0.8'),
    ]
    for path, changefreq, priority in main_pages:
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{base_url}{path}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>{changefreq}</changefreq>')
        sitemap.append(f'    <priority>{priority}</priority>')
        sitemap.append(f'  </url>')
    
    # Cities
    from slugify import slugify
    cities = db.query(City).all()
    for city in cities:
        city_slug = slugify(city.name)  # Generate slug from city name
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{base_url}/cities/{city_slug}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>weekly</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
    
    # SPAs
    spas = db.query(Spa).filter(Spa.is_active == True).all()
    for spa in spas:
        lastmod = spa.updated_at.strftime('%Y-%m-%d') if spa.updated_at else today
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{base_url}/spas/{spa.slug}</loc>')
        sitemap.append(f'    <lastmod>{lastmod}</lastmod>')
        sitemap.append(f'    <changefreq>weekly</changefreq>')
        sitemap.append(f'    <priority>0.7</priority>')
        sitemap.append(f'  </url>')
    
    # Jobs
    jobs = db.query(Job).filter(Job.is_active == True).all()
    for job in jobs:
        lastmod = job.updated_at.strftime('%Y-%m-%d') if job.updated_at else today
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{base_url}/jobs/{job.slug}</loc>')
        sitemap.append(f'    <lastmod>{lastmod}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.9</priority>')
        sitemap.append(f'  </url>')
    
    # Category + Location pages (e.g., /therapist-jobs-in-mumbai)
    from app.modules.jobs.models import JobCategory
    from sqlalchemy import func
    
    # Get popular category + city combinations
    category_city_combos = db.query(
        JobCategory.name,
        JobCategory.slug,
        City.name,
        func.count(Job.id).label('job_count')
    ).join(
        Job, JobCategory.id == Job.job_category_id
    ).join(
        City, Job.city_id == City.id
    ).filter(
        Job.is_active == True
    ).group_by(
        JobCategory.name, JobCategory.slug, City.name
    ).having(
        func.count(Job.id) >= 5  # Only include if 5+ jobs
    ).limit(100).all()
    
    for category_name, category_slug, city_name, job_count in category_city_combos:
        # Create slug-friendly versions
        category_slug_clean = category_slug.replace('_', '-').lower()
        city_slug_clean = slugify(city_name)  # Generate slug from city name
        
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{base_url}/jobs/category/{category_slug_clean}/location/{city_slug_clean}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.85</priority>')
        sitemap.append(f'  </url>')
    
    sitemap.append('</urlset>')
    
    return '\n'.join(sitemap)

