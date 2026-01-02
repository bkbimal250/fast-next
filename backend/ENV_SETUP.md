# Environment Variables Setup

## Backend (.env file)

Create a `.env` file in the `backend` directory with the following content:

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

# Email Configuration (Optional - for job notifications and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# Redis Configuration (Optional - for caching)
REDIS_URL=
REDIS_ENABLED=false

# Celery Configuration (Optional - for background tasks)
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=

# Logging
LOG_LEVEL=INFO
```

## Frontend (.env.local file)

Create a `.env.local` file in the `frontend` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8010

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SEO Verification (Optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=
NEXT_PUBLIC_YANDEX_VERIFICATION=
```

## Quick Setup

1. **Backend**: Copy `backend/.env.example` to `backend/.env` and update the values
2. **Frontend**: Copy `frontend/.env.example` to `frontend/.env.local` and update the values

## Important Notes

- The `.env` and `.env.local` files are in `.gitignore` and won't be committed to git
- Change `SECRET_KEY` to a random string in production
- Update `SITE_URL` to your production domain when deploying
- PostgreSQL password is set to: `Spajobs@8989`
- Database name is: `spajobsindia`

