"""
Rate limiting middleware for API protection
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time
from app.core.config import settings

# In-memory rate limit storage (use Redis in production for distributed systems)
_rate_limit_store: dict = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    
    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/"]:
            return await call_next(request)
        
        # In DEBUG mode, use much higher rate limits for development
        if settings.LOG_LEVEL == "DEBUG":
            # Allow 1000 requests per minute and 10000 per hour in development
            rate_limit_per_minute = 1000
            rate_limit_per_hour = 10000
        else:
            rate_limit_per_minute = settings.RATE_LIMIT_PER_MINUTE
            rate_limit_per_hour = settings.RATE_LIMIT_PER_HOUR
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check rate limits
        current_time = time.time()
        
        # Clean old entries (older than 1 hour)
        if client_ip in _rate_limit_store:
            _rate_limit_store[client_ip] = [
                timestamp for timestamp in _rate_limit_store[client_ip]
                if current_time - timestamp < 3600
            ]
        
        # Check per-minute limit
        minute_requests = [
            ts for ts in _rate_limit_store[client_ip]
            if current_time - ts < 60
        ]
        
        if len(minute_requests) >= rate_limit_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Rate limit exceeded: {rate_limit_per_minute} requests per minute"
                },
                headers={"Retry-After": "60"}
            )
        
        # Check per-hour limit
        hour_requests = [
            ts for ts in _rate_limit_store[client_ip]
            if current_time - ts < 3600
        ]
        
        if len(hour_requests) >= rate_limit_per_hour:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Rate limit exceeded: {rate_limit_per_hour} requests per hour"
                },
                headers={"Retry-After": "3600"}
            )
        
        # Record this request
        _rate_limit_store[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        return response


def get_rate_limit_info(client_ip: str) -> dict:
    """Get rate limit information for a client IP"""
    current_time = time.time()
    
    if client_ip not in _rate_limit_store:
        return {
            "requests_per_minute": 0,
            "requests_per_hour": 0,
            "limit_per_minute": settings.RATE_LIMIT_PER_MINUTE,
            "limit_per_hour": settings.RATE_LIMIT_PER_HOUR,
        }
    
    timestamps = _rate_limit_store[client_ip]
    minute_requests = [ts for ts in timestamps if current_time - ts < 60]
    hour_requests = [ts for ts in timestamps if current_time - ts < 3600]
    
    return {
        "requests_per_minute": len(minute_requests),
        "requests_per_hour": len(hour_requests),
        "limit_per_minute": settings.RATE_LIMIT_PER_MINUTE,
        "limit_per_hour": settings.RATE_LIMIT_PER_HOUR,
    }

