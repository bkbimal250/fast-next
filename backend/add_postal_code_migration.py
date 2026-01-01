"""
Migration script to add postalCode column to jobs and spas tables
Run this script: python add_postal_code_migration.py
"""

from sqlalchemy import text
from app.core.database import engine

def add_postal_code_columns():
    """Add postalCode column to jobs and spas tables if they don't exist"""
    
    with engine.connect() as conn:
        try:
            # Check and add postalCode to jobs table
            check_jobs_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'jobs' 
                AND column_name = 'postalCode'
            """)
            
            result = conn.execute(check_jobs_query)
            jobs_column_exists = result.fetchone() is not None
            
            if not jobs_column_exists:
                alter_jobs_query = text('ALTER TABLE jobs ADD COLUMN "postalCode" VARCHAR(10)')
                conn.execute(alter_jobs_query)
                print("✅ Column 'postalCode' added successfully to jobs table")
            else:
                print("ℹ️  Column 'postalCode' already exists in jobs table")
            
            # Check and add postalCode to spas table
            check_spas_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'spas' 
                AND column_name = 'postalCode'
            """)
            
            result = conn.execute(check_spas_query)
            spas_column_exists = result.fetchone() is not None
            
            if not spas_column_exists:
                alter_spas_query = text('ALTER TABLE spas ADD COLUMN "postalCode" VARCHAR(10)')
                conn.execute(alter_spas_query)
                print("✅ Column 'postalCode' added successfully to spas table")
            else:
                print("ℹ️  Column 'postalCode' already exists in spas table")
            
            conn.commit()
            print("✅ Migration completed successfully!")
            
        except Exception as e:
            conn.rollback()
            print(f"❌ Error during migration: {e}")
            raise

if __name__ == "__main__":
    print("Starting migration to add postalCode columns...")
    add_postal_code_columns()

