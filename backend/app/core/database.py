"""
Database configuration and session management
Optimized for high concurrency (1000+ users)
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import os

# Determine database URL based on DATABASE_TYPE
if settings.DATABASE_URL:
    # Use explicit DATABASE_URL if provided
    DATABASE_URL = settings.DATABASE_URL
elif settings.DATABASE_TYPE == "sqlite":
    # SQLite for testing - NOT recommended for production with 1000+ users
    DATABASE_URL = f"sqlite:///./{settings.SQLITE_DB_PATH}"
else:
    # PostgreSQL for production
    if not all([settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_DB]):
        raise ValueError("PostgreSQL settings are required when DATABASE_TYPE is 'postgresql'")
    DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

# Create engine with optimized settings for high concurrency
if settings.DATABASE_TYPE == "sqlite":
    # SQLite-specific settings (for development only)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
else:
    # PostgreSQL settings optimized for 1000+ concurrent users
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        poolclass=QueuePool,
        pool_size=20,  # Base pool size - adjust based on server capacity
        max_overflow=40,  # Additional connections when pool is exhausted (total: 60)
        pool_pre_ping=True,  # Verify connections before using (prevents stale connections)
        pool_recycle=3600,  # Recycle connections after 1 hour
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
    
    Base.metadata.create_all(bind=engine)

