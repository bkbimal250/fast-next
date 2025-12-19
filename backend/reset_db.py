"""
Reset database - Drop all tables and recreate them
WARNING: This will delete all data!
"""

import os
import sys
from sqlalchemy import inspect
from app.core.database import engine, Base, init_db
from app.core.config import settings

def reset_database():
    """Drop all tables and recreate them"""
    print("=" * 60)
    print("WARNING: This will delete all data in the database!")
    print("=" * 60)
    
    # Import all models to ensure they're registered with Base
    import app.modules.users.models
    import app.modules.locations.models
    import app.modules.spas.models
    import app.modules.jobs.models
    import app.modules.applications.models
    import app.modules.messages.models
    import app.modules.analytics.models
    
    try:
        # Drop all tables first (works for both SQLite and PostgreSQL)
        print("\nDropping all existing tables...")
        try:
            Base.metadata.drop_all(bind=engine)
            print("OK: All tables dropped successfully.")
        except Exception as e:
            print(f"Warning: Error dropping tables (may not exist): {e}")
            # Try to continue anyway
        
        # For SQLite, also try to delete the file if tables were dropped
        if settings.DATABASE_TYPE == "sqlite":
            # Close connections
            engine.dispose()
            db_path = settings.SQLITE_DB_PATH
            if os.path.exists(db_path):
                try:
                    # Try to delete the file, but it's OK if we can't (we already dropped tables)
                    os.remove(db_path)
                    print(f"OK: Database file deleted: {db_path}")
                except (PermissionError, OSError):
                    # File is locked, but tables are dropped, so continue
                    print(f"Info: Could not delete database file (may be locked), but tables are dropped.")
                    print(f"     The database will be recreated when we create tables.")
        
        # Recreate all tables
        print("\nCreating all database tables...")
        Base.metadata.create_all(bind=engine)
        print("OK: Database tables created successfully!")
        
        print("\n" + "=" * 60)
        print("Database reset complete!")
        print("=" * 60)
        print("\nYou can now restart the server and the database will be fresh.")
        
    except Exception as e:
        print(f"\nERROR: Failed to reset database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Add backend directory to Python path
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    reset_database()

