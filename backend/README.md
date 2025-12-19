# SPA Job Portal - Backend API

Location-intelligent, SEO-first SPA Job Portal Backend built with FastAPI.

## Features

- ✅ Location-based job search (SQLite for testing, PostGIS for production)
- ✅ SEO-optimized job listings
- ✅ Apply without login (CV upload)
- ✅ Message SPA directly
- ✅ Analytics tracking
- ✅ Admin dashboard

## Setup

### Quick Start (SQLite - Testing)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The `.env` file is already configured for SQLite testing. No additional setup needed!

3. Test database setup:
```bash
python test_db.py
```

4. Start server:
```bash
uvicorn app.main:app --reload
```

### Production Setup (PostgreSQL)

1. Install PostgreSQL and PostGIS extension

2. Update `.env` file:
```
DATABASE_TYPE=postgresql
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=spajobs
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

3. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start server:
```bash
uvicorn app.main:app --reload
```

## Database Configuration

The application supports both SQLite (for testing) and PostgreSQL (for production):

- **SQLite** (default): No setup required, database file created automatically
- **PostgreSQL**: Requires database server and PostGIS extension for advanced geo queries

Set `DATABASE_TYPE=sqlite` or `DATABASE_TYPE=postgresql` in `.env`

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

