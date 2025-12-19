"""
Add missing columns to existing database tables
This script adds columns that are missing from the database schema
"""

import sqlite3
import os
import sys
from app.core.config import settings

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def migrate_database():
    """Add missing columns to database tables"""
    if settings.DATABASE_TYPE != "sqlite":
        print("This migration script is only for SQLite databases.")
        return
    
    db_path = settings.SQLITE_DB_PATH
    if not os.path.exists(db_path):
        print(f"Database file {db_path} does not exist. Run the server first to create it.")
        return
    
    print("=" * 60)
    print("Migrating database schema...")
    print("=" * 60)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check and add missing columns to spas table
        cursor.execute("PRAGMA table_info(spas)")
        spa_columns = [row[1] for row in cursor.fetchall()]
        
        if 'website' not in spa_columns:
            print("Adding 'website' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN website VARCHAR")
            print("[OK] Added 'website' column")
        
        if 'directions' not in spa_columns:
            print("Adding 'directions' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN directions TEXT")
            print("[OK] Added 'directions' column")
        
        if 'opening_hours' not in spa_columns:
            print("Adding 'opening_hours' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN opening_hours VARCHAR")
            print("[OK] Added 'opening_hours' column")
        
        if 'closing_hours' not in spa_columns:
            print("Adding 'closing_hours' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN closing_hours VARCHAR")
            print("[OK] Added 'closing_hours' column")
        
        if 'booking_url_website' not in spa_columns:
            print("Adding 'booking_url_website' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN booking_url_website VARCHAR")
            print("[OK] Added 'booking_url_website' column")
        
        if 'country_id' not in spa_columns:
            print("Adding 'country_id' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN country_id INTEGER")
            print("[OK] Added 'country_id' column")
        
        if 'state_id' not in spa_columns:
            print("Adding 'state_id' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN state_id INTEGER")
            print("[OK] Added 'state_id' column")
        
        if 'city_id' not in spa_columns:
            print("Adding 'city_id' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN city_id INTEGER")
            print("[OK] Added 'city_id' column")
        
        if 'area_id' not in spa_columns:
            print("Adding 'area_id' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN area_id INTEGER")
            print("[OK] Added 'area_id' column")
        
        if 'created_by' not in spa_columns:
            print("Adding 'created_by' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN created_by INTEGER")
            print("[OK] Added 'created_by' column")
        
        if 'updated_by' not in spa_columns:
            print("Adding 'updated_by' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN updated_by INTEGER")
            print("[OK] Added 'updated_by' column")
        
        if 'spa_images' not in spa_columns:
            print("Adding 'spa_images' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN spa_images TEXT")  # JSON stored as TEXT in SQLite
            print("[OK] Added 'spa_images' column")
        
        if 'created_at' not in spa_columns:
            print("Adding 'created_at' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN created_at DATETIME")
            print("[OK] Added 'created_at' column")
        
        if 'updated_at' not in spa_columns:
            print("Adding 'updated_at' column to spas table...")
            cursor.execute("ALTER TABLE spas ADD COLUMN updated_at DATETIME")
            print("[OK] Added 'updated_at' column")
        
        # Check and add missing columns to states table
        cursor.execute("PRAGMA table_info(states)")
        state_columns = [row[1] for row in cursor.fetchall()]
        
        if 'country_id' not in state_columns:
            print("Adding 'country_id' column to states table...")
            cursor.execute("ALTER TABLE states ADD COLUMN country_id INTEGER NOT NULL DEFAULT 1")
            print("[OK] Added 'country_id' column")
        
        # Check and add missing columns to cities table
        cursor.execute("PRAGMA table_info(cities)")
        city_columns = [row[1] for row in cursor.fetchall()]
        
        if 'state_id' not in city_columns:
            print("Adding 'state_id' column to cities table...")
            cursor.execute("ALTER TABLE cities ADD COLUMN state_id INTEGER NOT NULL DEFAULT 1")
            print("[OK] Added 'state_id' column")
        
        if 'country_id' not in city_columns:
            print("Adding 'country_id' column to cities table...")
            cursor.execute("ALTER TABLE cities ADD COLUMN country_id INTEGER NOT NULL DEFAULT 1")
            print("[OK] Added 'country_id' column")
        
        # Commit changes
        conn.commit()
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
        print("\nYou can now restart the server.")
        
    except sqlite3.Error as e:
        print(f"\nError during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    # Add backend directory to Python path
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    migrate_database()

