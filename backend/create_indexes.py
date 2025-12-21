"""
Database index creation script for performance optimization
Run this script to create all necessary indexes for handling 1000+ concurrent users

Usage:
    python create_indexes.py
"""

from app.core.database import engine, Base
from sqlalchemy import text
from app.core.config import settings

def create_indexes():
    """Create all performance indexes"""
    
    if settings.DATABASE_TYPE == "sqlite":
        print("⚠️  WARNING: SQLite is not recommended for production with 1000+ users.")
        print("   Please use PostgreSQL for production.")
        return
    
    print("Creating database indexes for performance optimization...")
    
    indexes = [
        # Jobs table indexes
        ("idx_jobs_spa_id", "jobs", "spa_id"),
        ("idx_jobs_city_id", "jobs", "city_id"),
        ("idx_jobs_state_id", "jobs", "state_id"),
        ("idx_jobs_country_id", "jobs", "country_id"),
        ("idx_jobs_area_id", "jobs", "area_id"),
        ("idx_jobs_is_active", "jobs", "is_active"),
        ("idx_jobs_is_featured", "jobs", "is_featured"),
        ("idx_jobs_created_at", "jobs", "created_at"),
        ("idx_jobs_view_count", "jobs", "view_count"),
        ("idx_jobs_slug", "jobs", "slug"),
        ("idx_jobs_job_type_id", "jobs", "job_type_id"),
        ("idx_jobs_job_category_id", "jobs", "job_category_id"),
        
        # SPAs table indexes
        ("idx_spas_city_id", "spas", "city_id"),
        ("idx_spas_state_id", "spas", "state_id"),
        ("idx_spas_country_id", "spas", "country_id"),
        ("idx_spas_area_id", "spas", "area_id"),
        ("idx_spas_is_active", "spas", "is_active"),
        ("idx_spas_is_verified", "spas", "is_verified"),
        ("idx_spas_rating", "spas", "rating"),
        ("idx_spas_slug", "spas", "slug"),
        ("idx_spas_created_by", "spas", "created_by"),
        
        # Users table indexes
        ("idx_users_email", "users", "email"),
        ("idx_users_role", "users", "role"),
        ("idx_users_managed_spa_id", "users", "managed_spa_id"),
        
        # Applications table indexes
        ("idx_applications_job_id", "job_applications", "job_id"),
        ("idx_applications_user_id", "job_applications", "user_id"),
        ("idx_applications_created_at", "job_applications", "created_at"),
        
        # Messages table indexes
        ("idx_messages_job_id", "messages", "job_id"),
        ("idx_messages_spa_id", "messages", "spa_id"),
        ("idx_messages_created_at", "messages", "created_at"),
        
        # Analytics table indexes
        ("idx_analytics_event_type", "analytics_events", "event_type"),
        ("idx_analytics_job_id", "analytics_events", "job_id"),
        ("idx_analytics_created_at", "analytics_events", "created_at"),
        
        # Locations indexes
        ("idx_cities_state_id", "cities", "state_id"),
        ("idx_areas_city_id", "areas", "city_id"),
        ("idx_states_country_id", "states", "country_id"),
    ]
    
    with engine.connect() as conn:
        for index_name, table_name, column_name in indexes:
            try:
                # Check if index already exists
                check_sql = text(f"""
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = :index_name
                """)
                result = conn.execute(check_sql, {"index_name": index_name})
                if result.fetchone():
                    print(f"  ✓ Index {index_name} already exists")
                    continue
                
                # Create index
                create_sql = text(f"""
                    CREATE INDEX IF NOT EXISTS {index_name} 
                    ON {table_name} ({column_name})
                """)
                conn.execute(create_sql)
                conn.commit()
                print(f"  ✓ Created index {index_name} on {table_name}.{column_name}")
            except Exception as e:
                print(f"  ✗ Failed to create index {index_name}: {e}")
    
    print("\n✅ Index creation completed!")
    print("\nNote: For optimal performance with 1000+ users:")
    print("  1. Use PostgreSQL (not SQLite)")
    print("  2. Enable Redis caching")
    print("  3. Configure connection pooling")
    print("  4. Use a load balancer for multiple servers")


if __name__ == "__main__":
    create_indexes()

