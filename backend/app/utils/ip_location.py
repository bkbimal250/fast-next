"""
IP-based location detection using geoip-lite
"""
import geoip_lite
from typing import Optional, Dict

def get_location_from_ip(ip_address: str) -> Optional[Dict[str, str]]:
    """
    Get location information from IP address using geoip-lite
    
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
        
        geo = geoip_lite.lookup(ip_address)
        if geo:
            return {
                'city': geo.city or 'Unknown',
                'state': geo.region or 'Unknown',
                'country': geo.country or 'Unknown',
                'latitude': geo.latitude or None,
                'longitude': geo.longitude or None,
            }
    except Exception as e:
        print(f"Error getting location from IP {ip_address}: {e}")
    
    return None
