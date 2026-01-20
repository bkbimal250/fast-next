"""
Database configuration and session management
Optimized for high concurrency (1000+ users)
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings
from urllib.parse import quote_plus
import os

# Determine database URL - PostgreSQL Only
if settings.DATABASE_URL:
    # Use explicit DATABASE_URL if provided
    DATABASE_URL = settings.DATABASE_URL
else:
    # Build PostgreSQL connection URL from individual settings
    # URL-encode username and password to handle special characters like @, :, /, etc.
    if not all([settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_DB]):
        raise ValueError("PostgreSQL settings are required: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB")
    
    # URL-encode credentials to handle special characters
    encoded_user = quote_plus(settings.POSTGRES_USER)
    encoded_password = quote_plus(settings.POSTGRES_PASSWORD)
    encoded_db = quote_plus(settings.POSTGRES_DB)
    
    DATABASE_URL = f"postgresql://{encoded_user}:{encoded_password}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{encoded_db}"

# Create PostgreSQL engine optimized for high concurrency (1000+ users)
engine = create_engine(
    DATABASE_URL,
    echo=False,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,  # Base pool size - adjust based on server capacity
    max_overflow=settings.DB_MAX_OVERFLOW,  # Additional connections when pool is exhausted
    pool_pre_ping=True,  # Verify connections before using (prevents stale connections)
    pool_recycle=settings.DB_POOL_RECYCLE,  # Recycle connections after specified seconds
    pool_timeout=30,  # Timeout for getting connection from pool
    connect_args={
        "connect_timeout": 10,
        "application_name": "spa_job_portal",
    },
    # Enable statement caching for better performance
    execution_options={
        "isolation_level": "READ COMMITTED",  # Better concurrency than SERIALIZABLE
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    # Import all models to ensure they're registered with Base
    import app.modules.users.models
    import app.modules.locations.models
    import app.modules.spas.models
    import app.modules.jobs.models
    import app.modules.applications.models
    import app.modules.messages.models
    import app.modules.analytics.models
    import app.modules.subscribe.models
    import app.modules.contact.models
    import app.modules.whatsaapLeads.models
    
    Base.metadata.create_all(bind=engine)

