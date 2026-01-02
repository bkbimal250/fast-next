"""
Migration script to update messages.job_id foreign key constraint
Changes from CASCADE to SET NULL so messages are preserved when jobs are deleted
Run this script: python update_message_job_foreign_key.py
"""

from sqlalchemy import text
from app.core.database import engine


def update_message_job_foreign_key():
    """Update messages.job_id foreign key constraint from CASCADE to SET NULL"""
    with engine.connect() as conn:
        try:
            # Step 1: Find the existing foreign key constraint name
            find_constraint = text("""
                SELECT tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.table_name = 'messages'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND kcu.column_name = 'job_id'
                LIMIT 1;
            """)
            
            result = conn.execute(find_constraint)
            row = result.fetchone()
            
            if row:
                constraint_name = row[0]
                print(f"Found constraint: {constraint_name}")
                
                # Step 2: Drop the existing constraint
                drop_constraint = text(f'ALTER TABLE messages DROP CONSTRAINT IF EXISTS "{constraint_name}" CASCADE;')
                conn.execute(drop_constraint)
                print(f"✅ Dropped existing constraint: {constraint_name}")
            else:
                print("ℹ️  No existing foreign key constraint found on messages.job_id")
            
            # Step 3: Add new foreign key constraint with SET NULL
            add_constraint_query = text("""
                ALTER TABLE messages 
                ADD CONSTRAINT messages_job_id_fkey 
                FOREIGN KEY (job_id) 
                REFERENCES jobs(id) 
                ON DELETE SET NULL;
            """)
            
            conn.execute(add_constraint_query)
            print("✅ Added new foreign key constraint with SET NULL")
            
            conn.commit()
            print("✅ Migration completed successfully!")
            
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                print("ℹ️  Constraint already exists with SET NULL - migration may have already been run")
            else:
                print(f"❌ Error during migration: {e}")
                raise


if __name__ == "__main__":
    update_message_job_foreign_key()

