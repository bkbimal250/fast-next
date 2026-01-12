"""
Sitemap generation
"""

from fastapi import Response
from sqlalchemy.orm import Session
from app.modules.jobs.models import Job
from app.modules.spas.models import Spa
from app.modules.locations.models import City
from app.core.config import settings
from xml.sax.saxutils import escape


def escape_xml(text: str) -> str:
    """Escape XML special characters in URLs"""
    return escape(text, {'"': '&quot;', "'": '&apos;'})


def generate_sitemap(db: Session) -> str:
    """Generate XML sitemap"""
    from datetime import datetime
    from urllib.parse import quote
    
    base_url = settings.SITE_URL.rstrip('/')  # Remove trailing slash
    today = datetime.utcnow().strftime('%Y-%m-%d')
    
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Homepage
    sitemap.append(f'  <url>')
    sitemap.append(f'    <loc>{escape_xml(base_url)}</loc>')
    sitemap.append(f'    <lastmod>{today}</lastmod>')
    sitemap.append(f'    <changefreq>daily</changefreq>')
    sitemap.append(f'    <priority>1.0</priority>')
    sitemap.append(f'  </url>')
    
    # Main pages
    main_pages = [
        ('/jobs', 'daily', '0.9'),
        ('/spa-near-me', 'weekly', '0.8'),
        ('/about', 'monthly', '0.6'),
        ('/contact', 'monthly', '0.6'),
        ('/terms', 'yearly', '0.5'),
        ('/privacy', 'yearly', '0.5'),
    ]
    for path, changefreq, priority in main_pages:
        url = f'{base_url}{path}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>{changefreq}</changefreq>')
        sitemap.append(f'    <priority>{priority}</priority>')
        sitemap.append(f'  </url>')
    
    # Cities
    from slugify import slugify
    from app.modules.locations.models import Area
    
    cities = db.query(City).all()
    for city in cities:
        city_slug = slugify(city.name)  # Generate slug from city name
        url = f'{base_url}/cities/{quote(city_slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>weekly</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
        
        # Areas within each city (only include areas with jobs or spas)
        areas = db.query(Area).filter(Area.city_id == city.id).all()
        for area in areas:
            # Only include areas that have active jobs or active spas
            has_jobs = db.query(Job).filter(
                Job.area_id == area.id,
                Job.is_active == True
            ).count() > 0
            has_spas = db.query(Spa).filter(
                Spa.area_id == area.id,
                Spa.is_active == True
            ).count() > 0
            
            if has_jobs or has_spas:
                area_slug = slugify(area.name)
                url = f'{base_url}/cities/{quote(city_slug, safe="")}/{quote(area_slug, safe="")}'
                sitemap.append(f'  <url>')
                sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
                sitemap.append(f'    <lastmod>{today}</lastmod>')
                sitemap.append(f'    <changefreq>weekly</changefreq>')
                sitemap.append(f'    <priority>0.75</priority>')
                sitemap.append(f'  </url>')
    
    # SPAs - Fixed route from /spas/ to /besttopspas/
    spas = db.query(Spa).filter(Spa.is_active == True).all()
    for spa in spas:
        lastmod = spa.updated_at.strftime('%Y-%m-%d') if spa.updated_at else today
        url = f'{base_url}/besttopspas/{quote(spa.slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
        sitemap.append(f'    <lastmod>{lastmod}</lastmod>')
        sitemap.append(f'    <changefreq>weekly</changefreq>')
        sitemap.append(f'    <priority>0.7</priority>')
        sitemap.append(f'  </url>')
    
    # Jobs
    jobs = db.query(Job).filter(Job.is_active == True).all()
    for job in jobs:
        lastmod = job.updated_at.strftime('%Y-%m-%d') if job.updated_at else today
        url = f'{base_url}/jobs/{quote(job.slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
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
        url = f'{base_url}/jobs/category/{quote(category_slug_clean, safe="")}/location/{quote(city_slug_clean, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.85</priority>')
        sitemap.append(f'  </url>')
    
    # Spa Jobs in Location pages - Dynamic location-based spa job pages
    from app.modules.locations.models import Area, State
    
    # Get all unique location combinations that have spa jobs
    # Format: /spa-jobs-in-{area}-{city}-{state} and /spa-jobs-in/{area}/{city}/{state}
    
    # Get area + city + state combinations with spa jobs
    area_city_state_combos = db.query(
        Area.name.label('area_name'),
        City.name.label('city_name'),
        State.name.label('state_name'),
        func.count(Job.id).label('job_count')
    ).join(
        Job, Job.area_id == Area.id
    ).join(
        City, Job.city_id == City.id
    ).join(
        State, Job.state_id == State.id
    ).filter(
        Job.is_active == True,
        Job.area_id.isnot(None)  # Only include jobs with areas
    ).group_by(
        Area.name, Area.id, City.name, City.id, State.name, State.id
    ).having(
        func.count(Job.id) > 0  # Only include if has jobs
    ).all()
    
    for area_name, city_name, state_name, job_count in area_city_state_combos:
        # Create slug-friendly versions
        area_slug = slugify(area_name)
        city_slug = slugify(city_name)
        state_slug = slugify(state_name)
        
        # Format 1: /spa-jobs-in-{area}-{city}-{state}
        location_slug_hyphen = f'{area_slug}-{city_slug}-{state_slug}'
        url1 = f'{base_url}/spa-jobs-in-{quote(location_slug_hyphen, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url1)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
        
        # Format 2: /spa-jobs-in/{area}/{city}/{state}
        url2 = f'{base_url}/spa-jobs-in/{quote(area_slug, safe="")}/{quote(city_slug, safe="")}/{quote(state_slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url2)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
    
    # Get city + state combinations with spa jobs (without area)
    city_state_combos = db.query(
        City.name.label('city_name'),
        State.name.label('state_name'),
        func.count(Job.id).label('job_count')
    ).join(
        Job, Job.city_id == City.id
    ).join(
        State, Job.state_id == State.id
    ).filter(
        Job.is_active == True,
        Job.area_id.is_(None)  # Only include jobs without areas
    ).group_by(
        City.name, City.id, State.name, State.id
    ).having(
        func.count(Job.id) > 0  # Only include if has jobs
    ).all()
    
    for city_name, state_name, job_count in city_state_combos:
        # Create slug-friendly versions
        city_slug = slugify(city_name)
        state_slug = slugify(state_name)
        
        # Format 1: /spa-jobs-in-{city}-{state}
        location_slug_hyphen = f'{city_slug}-{state_slug}'
        url1 = f'{base_url}/spa-jobs-in-{quote(location_slug_hyphen, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url1)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
        
        # Format 2: /spa-jobs-in/{city}/{state}
        url2 = f'{base_url}/spa-jobs-in/{quote(city_slug, safe="")}/{quote(state_slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url2)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
    
    # Get city-only combinations with spa jobs
    city_only_combos = db.query(
        City.name.label('city_name'),
        func.count(Job.id).label('job_count')
    ).join(
        Job, Job.city_id == City.id
    ).filter(
        Job.is_active == True
    ).group_by(
        City.name, City.id
    ).having(
        func.count(Job.id) > 0  # Only include if has jobs
    ).all()
    
    for city_name, job_count in city_only_combos:
        # Create slug-friendly version
        city_slug = slugify(city_name)
        
        # Format 1: /spa-jobs-in-{city}
        url1 = f'{base_url}/spa-jobs-in-{quote(city_slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url1)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
        
        # Format 2: /spa-jobs-in/{city}
        url2 = f'{base_url}/spa-jobs-in/{quote(city_slug, safe="")}'
        sitemap.append(f'  <url>')
        sitemap.append(f'    <loc>{escape_xml(url2)}</loc>')
        sitemap.append(f'    <lastmod>{today}</lastmod>')
        sitemap.append(f'    <changefreq>daily</changefreq>')
        sitemap.append(f'    <priority>0.8</priority>')
        sitemap.append(f'  </url>')
    
    sitemap.append('</urlset>')
    
    return '\n'.join(sitemap)

