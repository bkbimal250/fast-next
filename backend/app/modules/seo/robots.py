"""
Robots.txt generation
"""

def generate_robots_txt() -> str:
    """Generate robots.txt content"""
    return """User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://yourdomain.com/sitemap.xml
"""

