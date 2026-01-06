"""
Migration script to add benefits and job_timing columns to jobs table if they don't exist
Run this script: python add_benefits_jobtiming_migration.py
"""

from sqlalchemy import text
from app.core.database import engine

def add_benefits_jobtiming_columns():
    """Add benefits and job_timing columns to jobs table if they don't exist"""
    with engine.connect() as conn:
        # Check if benefits column exists
        check_benefits = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' 
            AND column_name = 'benefits'
        """)
        
        result = conn.execute(check_benefits)
        benefits_exists = result.fetchone() is not None
        
        if not benefits_exists:
            # Add the benefits column
            alter_benefits = text("""
                ALTER TABLE jobs 
                ADD COLUMN benefits TEXT
            """)
            
            conn.execute(alter_benefits)
            conn.commit()
            print("✅ Column 'benefits' added successfully to jobs table")
        else:
            print("ℹ️  Column 'benefits' already exists in jobs table")
        
        # Check if job_timing column exists
        check_job_timing = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' 
            AND column_name = 'job_timing'
        """)
        
        result = conn.execute(check_job_timing)
        job_timing_exists = result.fetchone() is not None
        
        if not job_timing_exists:
            # Add the job_timing column
            alter_job_timing = text("""
                ALTER TABLE jobs 
                ADD COLUMN job_timing VARCHAR(255)
            """)
            
            conn.execute(alter_job_timing)
            conn.commit()
            print("✅ Column 'job_timing' added successfully to jobs table")
        else:
            print("ℹ️  Column 'job_timing' already exists in jobs table")
        
        print("Migration completed!")

if __name__ == "__main__":
    add_benefits_jobtiming_columns()

