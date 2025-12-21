"""
SEO API routes
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.seo import sitemap, robots

router = APIRouter(prefix="/api/seo", tags=["seo"])


@router.get("/sitemap.xml")
def get_sitemap(db: Session = Depends(get_db)):
    """Generate and return XML sitemap"""
    sitemap_xml = sitemap.generate_sitemap(db)
    return Response(
        content=sitemap_xml,
        media_type="application/xml",
        headers={
            "Cache-Control": "public, max-age=3600, s-maxage=3600"
        }
    )


@router.get("/robots.txt")
def get_robots_txt():
    """Generate and return robots.txt"""
    robots_txt = robots.generate_robots_txt()
    return Response(
        content=robots_txt,
        media_type="text/plain",
        headers={
            "Cache-Control": "public, max-age=86400"
        }
    )

