"""
Validation utilities
"""

import re
from typing import Optional


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number"""
    # Indian phone number pattern
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '')))


def validate_email(email: str) -> bool:
    """Validate email address"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

