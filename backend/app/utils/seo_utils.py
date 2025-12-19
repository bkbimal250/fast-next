"""
SEO utility functions
"""

import re
from slugify import slugify
import uuid


def generate_slug(text: str) -> str:
    """Generate basic URL-friendly slug from text (no uniqueness guarantee)."""
    return slugify(text)


def generate_unique_slug(text: str) -> str:
    """
    Generate a URL-friendly, SEO-optimized, unique slug.

    Uses slugified text + short random suffix to avoid DB collisions
    and to be safe under concurrent inserts.
    """
    base_slug = slugify(text)
    unique_suffix = uuid.uuid4().hex[:6]
    return f"{base_slug}-{unique_suffix}"


def truncate_text(text: str, max_length: int = 160) -> str:
    """Truncate text for meta descriptions."""
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."

