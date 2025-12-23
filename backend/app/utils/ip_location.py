"""
IP-based location detection (optional - uses geoip2 if available)
"""
from typing import Optional, Dict

# Try to import geoip2 (optional dependency)
try:
    import geoip2.database
    import geoip2.errors
    GEOIP2_AVAILABLE = True
except ImportError:
    GEOIP2_AVAILABLE = False

def get_location_from_ip(ip_address: str) -> Optional[Dict[str, str]]:
    """
    Get location information from IP address
    
    Args:
        ip_address: Client IP address
        
    Returns:
        Dict with city, state, country, latitude, longitude or None
    """
    try:
        # Handle localhost and private IPs
        if ip_address in ['127.0.0.1', 'localhost', '::1'] or ip_address.startswith('192.168.') or ip_address.startswith('10.'):
            # Return default India location for local development
            return {
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'latitude': 19.0760,
                'longitude': 72.8777,
            }
        
        # If geoip2 is not available, return None
        if not GEOIP2_AVAILABLE:
            return None
        
        # Note: geoip2 requires a database file (GeoLite2-City.mmdb)
        # For now, return None if not configured
        # To enable: pip install geoip2 and download GeoLite2 database
        return None
        
    except Exception as e:
        print(f"Error getting location from IP {ip_address}: {e}")
    
    return None
