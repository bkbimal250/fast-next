"""
Subscription utility functions
"""

import secrets


def generate_unsubscribe_token() -> str:
    """Generate a unique unsubscribe token"""
    return secrets.token_urlsafe(32)

