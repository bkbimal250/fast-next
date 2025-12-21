"""
Robots.txt generation
"""

from app.core.config import settings

def generate_robots_txt() -> str:
    """Generate robots.txt content"""
    base_url = settings.SITE_URL
    return f"""User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /login
Disallow: /register

# Googlebot
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# Bingbot
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: {base_url}/sitemap.xml
"""

