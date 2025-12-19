"""
Application configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_TYPE: str = "sqlite"  # "sqlite" or "postgresql"
    DATABASE_URL: Optional[str] = None  # Optional explicit database URL
    
    # SQLite settings (for testing)
    SQLITE_DB_PATH: str = "spajobs.db"
    
    # PostgreSQL settings (for production)
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
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
    NOMINATIM_RATE_LIMIT_SECONDS: int = 1  # Minimum seconds between requests
    GEOCODE_CACHE_HOURS: int = 24  # Cache resolved locations for 24 hours
    
    class Config:
        env_file = ".env"


settings = Settings()

