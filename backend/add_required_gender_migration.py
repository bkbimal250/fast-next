"""
Migration script to add required_gender column to jobs table
Run this script: python add_required_gender_migration.py
"""

from sqlalchemy import text
from app.core.database import engine

def add_required_gender_column():
    """Add required_gender column to jobs table if it doesn't exist"""
    with engine.connect() as conn:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' 
            AND column_name = 'required_gender'
        """)
        
        result = conn.execute(check_query)
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            # Add the column
            alter_query = text("""
                ALTER TABLE jobs 
                ADD COLUMN required_gender VARCHAR(255) NOT NULL DEFAULT 'Female'
            """)
            
            conn.execute(alter_query)
            conn.commit()
            print("✅ Column 'required_gender' added successfully to jobs table")
        else:
            print("ℹ️  Column 'required_gender' already exists in jobs table")
        
        print("Migration completed!")

if __name__ == "__main__":
    add_required_gender_column()

