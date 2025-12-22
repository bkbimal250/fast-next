# Environment Variables Setup Guide

## Backend .env File

**Location**: `backend/.env`

Create this file manually with the following content:

```env
# Database Configuration
DATABASE_TYPE=postgresql

# PostgreSQL Connection Settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Security
SECRET_KEY=dev-secret-key-change-this-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Site Configuration
SITE_URL=http://localhost:3000

# Email Configuration (Optional - for job notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

# Redis Configuration (Optional - for caching)
REDIS_URL=
REDIS_ENABLED=false

# Celery Configuration (Optional - for background tasks)
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=

# Logging
LOG_LEVEL=INFO
```

## Frontend .env.local File

**Location**: `frontend/.env.local`

Create this file manually with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SEO Verification (Optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=
NEXT_PUBLIC_YANDEX_VERIFICATION=
```

## Quick Setup Commands

### Windows (PowerShell):
```powershell
# Backend
cd backend
@"
DATABASE_TYPE=postgresql
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=dev-secret-key-change-this-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SITE_URL=http://localhost:3000
LOG_LEVEL=INFO
"@ | Out-File -FilePath .env -Encoding utf8

# Frontend
cd ..\frontend
@"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### Linux/Mac:
```bash
# Backend
cd backend
cat > .env << EOF
DATABASE_TYPE=postgresql
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=dev-secret-key-change-this-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SITE_URL=http://localhost:3000
LOG_LEVEL=INFO
EOF

# Frontend
cd ../frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
```

## PostgreSQL Database Info

- **Database Name**: `spajobsindia`
- **User**: `postgres`
- **Password**: `Spajobs@8989`
- **Host**: `localhost`
- **Port**: `5432`

## Next Steps

1. Create both `.env` files using the content above
2. Install PostgreSQL driver: `pip install psycopg2-binary`
3. Start the backend server - it will automatically create all tables
4. Run `python create_indexes.py` to create performance indexes

