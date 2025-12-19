"""
Geographic utility functions
"""

import math


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )
    
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance


def is_within_radius(
    lat1: float, lon1: float,
    lat2: float, lon2: float,
    radius_km: float
) -> bool:
    """Check if point 2 is within radius of point 1"""
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    return distance <= radius_km

