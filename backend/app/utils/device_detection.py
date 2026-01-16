"""
Device type detection utility
"""

import re


def detect_device_type(user_agent: str) -> str:
    """
    Detect device type from user agent string.
    Returns: 'mobile', 'tablet', or 'desktop'
    """
    if not user_agent:
        return 'desktop'
    
    user_agent_lower = user_agent.lower()
    
    # Tablet detection (check before mobile as tablets often contain mobile keywords)
    tablet_patterns = [
        r'ipad',
        r'android(?!.*mobile)',  # Android that's not mobile
        r'playbook',
        r'silk',
        r'kindle',
        r'tablet',
        r'nexus 7',
        r'nexus 10',
    ]
    
    for pattern in tablet_patterns:
        if re.search(pattern, user_agent_lower):
            return 'tablet'
    
    # Mobile detection
    mobile_patterns = [
        r'mobile',
        r'android',
        r'iphone',
        r'ipod',
        r'blackberry',
        r'windows phone',
        r'opera mini',
        r'palm',
        r'pocket',
    ]
    
    for pattern in mobile_patterns:
        if re.search(pattern, user_agent_lower):
            return 'mobile'
    
    # Default to desktop
    return 'desktop'
