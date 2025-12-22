# PostgreSQL Setup Guide

## Database Configuration

Your PostgreSQL database has been configured with:
- **Database Name**: `spajobsindia`
- **User**: `postgres`
- **Password**: `Spajobs@8989`
- **Host**: `localhost`
- **Port**: `5432`

## Environment Configuration

Create a `.env` file in the `backend` directory with the following:

```env
# PostgreSQL Connection Settings (Required)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Security
SECRET_KEY=your-secret-key-change-this-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Site Configuration
SITE_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
```

## Installation Steps

1. **Install PostgreSQL dependencies**:
```bash
pip install psycopg2-binary
```

2. **Initialize the database**:
```bash
# Start the server - it will automatically create all tables
uvicorn app.main:app --reload
```

3. **Create indexes for performance** (optional but recommended):
```bash
python create_indexes.py
```

## Verify Connection

The application will automatically:
- Connect to PostgreSQL on startup
- Create all necessary tables if they don't exist
- Set up proper connection pooling for high concurrency (20 base + 40 overflow connections)

## Database Features

- **Connection Pooling**: Optimized for 1000+ concurrent users
- **Automatic Table Creation**: All tables created on first run
- **Performance Indexes**: Run `create_indexes.py` for optimal performance
- **PostGIS Support**: Can be enabled later for advanced geo queries

## Notes

- The application is now PostgreSQL-only (SQLite support has been removed)
- All database operations are optimized for PostgreSQL
- Connection pooling is configured for high concurrency
- Tables are created automatically - no manual migration needed
