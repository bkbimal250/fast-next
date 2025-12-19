"""
Database configuration and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# Determine database URL based on DATABASE_TYPE
if settings.DATABASE_URL:
    # Use explicit DATABASE_URL if provided
    DATABASE_URL = settings.DATABASE_URL
elif settings.DATABASE_TYPE == "sqlite":
    # SQLite for testing
    DATABASE_URL = f"sqlite:///./{settings.SQLITE_DB_PATH}"
else:
    # PostgreSQL for production
    if not all([settings.POSTGRES_USER, settings.POSTGRES_PASSWORD, settings.POSTGRES_DB]):
        raise ValueError("PostgreSQL settings are required when DATABASE_TYPE is 'postgresql'")
    DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

# Create engine with appropriate settings
if settings.DATABASE_TYPE == "sqlite":
    # SQLite-specific settings
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Needed for SQLite
        echo=False  # Set to True for SQL query logging
    )
else:
    # PostgreSQL settings
    engine = create_engine(DATABASE_URL, echo=False)

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

