"""
Application configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database - PostgreSQL Only
    DATABASE_URL: Optional[str] = None  # Optional explicit database URL (overrides individual settings)
    
    # PostgreSQL settings (required)
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"  # Default for testing
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_CV_EXTENSIONS: list = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".webp"]
    
    # Image Processing
    IMAGE_COMPRESS_QUALITY: int = 85  # WebP quality (1-100)
    IMAGE_MAX_WIDTH: int = 1920  # Maximum image width in pixels
    IMAGE_MAX_HEIGHT: int = 1920  # Maximum image height in pixels
    
    # Analytics
    ANALYTICS_ENABLED: bool = True
    
    # SEO
    SITE_URL: str = "https://yourdomain.com"
    
    # Email (for password reset - optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    
    # Geocoding (OpenStreetMap Nominatim)
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    NOMINATIM_USER_AGENT: str = "SPA-Job-Portal/1.0"  # Required by Nominatim
    # Rate limiting commented out - can be uncommented later when needed
    # NOMINATIM_RATE_LIMIT_SECONDS: int = 1  # Minimum seconds between requests
    GEOCODE_CACHE_HOURS: int = 24  # Cache resolved locations for 24 hours
    
    # Performance & Scalability Settings
    REDIS_URL: Optional[str] = None  # Redis connection URL for caching (e.g., redis://localhost:6379/0)
    REDIS_ENABLED: bool = False  # Enable Redis caching
    CACHE_TTL_SECONDS: int = 300  # Default cache TTL (5 minutes)
    
    # Rate Limiting
    # COMMENTED OUT - Can be uncommented later when needed
    # Rate limits are automatically relaxed in DEBUG mode (1000/min, 10000/hour)
    # RATE_LIMIT_ENABLED: bool = True
    # RATE_LIMIT_PER_MINUTE: int = 200  # Requests per minute per IP (increased for development)
    # RATE_LIMIT_PER_HOUR: int = 5000  # Requests per hour per IP (increased for development)
    
    # Background Tasks
    CELERY_BROKER_URL: Optional[str] = None  # Redis or RabbitMQ URL for Celery
    CELERY_RESULT_BACKEND: Optional[str] = None  # Redis URL for Celery results
    
    # Database Connection Pool Settings (for PostgreSQL)
    DB_POOL_SIZE: int = 20  # Base connection pool size
    DB_MAX_OVERFLOW: int = 40  # Max overflow connections
    DB_POOL_RECYCLE: int = 3600  # Recycle connections after 1 hour
    
    # Logging
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR
    LOG_FILE: Optional[str] = None  # Optional log file path
    
    # Server
    PORT: int = 8010  # Server port (default: 8010)
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables that aren't defined in the model


settings = Settings()

