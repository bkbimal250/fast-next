"""
Caching utilities for improved performance
Supports both in-memory and Redis caching
"""

from typing import Optional, Any, Callable
import json
import hashlib
from functools import wraps
from app.core.config import settings

# In-memory cache as fallback
_memory_cache: dict = {}
_cache_timestamps: dict = {}

# Redis client (lazy import)
_redis_client = None


def get_redis_client():
    """Get Redis client (lazy initialization)"""
    global _redis_client
    if _redis_client is None and settings.REDIS_ENABLED and settings.REDIS_URL:
        try:
            import redis
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
            )
            # Test connection
            _redis_client.ping()
        except Exception as e:
            print(f"Redis connection failed, falling back to in-memory cache: {e}")
            _redis_client = None
    return _redis_client


def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from prefix and arguments"""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
    key_hash = hashlib.md5(key_data.encode()).hexdigest()
    return f"{prefix}:{key_hash}"


def cache_result(ttl: int = None, prefix: str = "cache"):
    """
    Decorator to cache function results
    
    Usage:
        @cache_result(ttl=300, prefix="jobs")
        def get_jobs():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_ttl = ttl or settings.CACHE_TTL_SECONDS
            cache_key = get_cache_key(f"{prefix}:{func.__name__}", *args, **kwargs)
            
            # Try Redis first
            redis_client = get_redis_client()
            if redis_client:
                try:
                    cached = redis_client.get(cache_key)
                    if cached:
                        return json.loads(cached)
                except Exception:
                    pass  # Fall back to memory cache
            
            # Try memory cache
            if cache_key in _memory_cache:
                timestamp = _cache_timestamps.get(cache_key, 0)
                if timestamp + cache_ttl > __import__('time').time():
                    return _memory_cache[cache_key]
                else:
                    # Expired, remove it
                    _memory_cache.pop(cache_key, None)
                    _cache_timestamps.pop(cache_key, None)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            if redis_client:
                try:
                    redis_client.setex(cache_key, cache_ttl, json.dumps(result))
                except Exception:
                    pass
            
            # Also store in memory cache
            _memory_cache[cache_key] = result
            _cache_timestamps[cache_key] = __import__('time').time()
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_ttl = ttl or settings.CACHE_TTL_SECONDS
            cache_key = get_cache_key(f"{prefix}:{func.__name__}", *args, **kwargs)
            
            # Try Redis first
            redis_client = get_redis_client()
            if redis_client:
                try:
                    cached = redis_client.get(cache_key)
                    if cached:
                        return json.loads(cached)
                except Exception:
                    pass  # Fall back to memory cache
            
            # Try memory cache
            if cache_key in _memory_cache:
                timestamp = _cache_timestamps.get(cache_key, 0)
                if timestamp + cache_ttl > __import__('time').time():
                    return _memory_cache[cache_key]
                else:
                    # Expired, remove it
                    _memory_cache.pop(cache_key, None)
                    _cache_timestamps.pop(cache_key, None)
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            if redis_client:
                try:
                    redis_client.setex(cache_key, cache_ttl, json.dumps(result))
                except Exception:
                    pass
            
            # Also store in memory cache
            _memory_cache[cache_key] = result
            _cache_timestamps[cache_key] = __import__('time').time()
            
            return result
        
        # Return appropriate wrapper based on function type
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def invalidate_cache(prefix: str, pattern: str = "*"):
    """Invalidate cache entries matching pattern"""
    redis_client = get_redis_client()
    if redis_client:
        try:
            keys = redis_client.keys(f"{prefix}:{pattern}")
            if keys:
                redis_client.delete(*keys)
        except Exception:
            pass
    
    # Also clear memory cache
    keys_to_remove = [k for k in _memory_cache.keys() if k.startswith(f"{prefix}:")]
    for key in keys_to_remove:
        _memory_cache.pop(key, None)
        _cache_timestamps.pop(key, None)


def clear_all_cache():
    """Clear all cache"""
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.flushdb()
        except Exception:
            pass
    
    _memory_cache.clear()
    _cache_timestamps.clear()

