# SPA Job Portal - Backend API

Location-intelligent, SEO-first SPA Job Portal Backend built with FastAPI.

## Features

- ✅ Location-based job search (PostgreSQL with PostGIS support)
- ✅ SEO-optimized job listings
- ✅ Apply without login (CV upload)
- ✅ Message SPA directly
- ✅ Analytics tracking
- ✅ Admin dashboard
- ✅ High concurrency support (1000+ users)

## Setup

### Prerequisites

1. **PostgreSQL** installed and running
2. **Python 3.9+** installed

### Installation Steps

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Create PostgreSQL database**:
```sql
CREATE DATABASE spajobsindia;
GRANT ALL PRIVILEGES ON DATABASE spajobsindia TO postgres;
```

3. **Configure environment variables**:
Create a `.env` file in the `backend` directory:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=your-secret-key-change-this-in-production
SITE_URL=http://localhost:3000
```

4. **Start server** (tables will be created automatically):
```bash
uvicorn app.main:app --reload
```

5. **Create indexes for performance** (optional but recommended):
```bash
python create_indexes.py
```

## Database Configuration

The application uses **PostgreSQL only** for production-ready performance:

- **PostgreSQL**: Required database server
- **PostGIS**: Optional extension for advanced geo queries (can be enabled later)
- **Connection Pooling**: Configured for high concurrency (20 base + 40 overflow connections)

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

