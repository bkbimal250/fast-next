# SPA Job Portal - Project Structure

## 📁 Complete Folder Structure

```
spajobs/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   │
│   │   ├── core/                    # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Settings & environment variables
│   │   │   ├── database.py         # Database connection & session
│   │   │   ├── security.py         # JWT, password hashing
│   │   │   └── logger.py           # Logging configuration
│   │   │
│   │   ├── modules/                 # Feature modules
│   │   │   │
│   │   │   ├── locations/           # City & Area management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py       # City, Area models
│   │   │   │   ├── schemas.py     # Pydantic schemas
│   │   │   │   ├── services.py    # Business logic
│   │   │   │   └── routes.py      # API endpoints
│   │   │   │
│   │   │   ├── spas/               # SPA management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── services.py
│   │   │   │   └── routes.py
│   │   │   │
│   │   │   ├── jobs/               # Job listings
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py      # Job, JobApplication models
│   │   │   │   ├── schemas.py
│   │   │   │   ├── seo.py         # SEO schema generation
│   │   │   │   ├── geo.py         # Geographic search
│   │   │   │   ├── services.py
│   │   │   │   └── routes.py
│   │   │   │
│   │   │   ├── applications/       # Job applications
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── upload.py      # CV file upload
│   │   │   │   └── routes.py
│   │   │   │
│   │   │   ├── messages/           # SPA messaging
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── routes.py
│   │   │   │
│   │   │   ├── analytics/          # Analytics tracking
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py      # AnalyticsEvent model
│   │   │   │   ├── trackers.py    # Event tracking
│   │   │   │   ├── reports.py     # Analytics reports
│   │   │   │   └── routes.py
│   │   │   │
│   │   │   ├── seo/                # SEO utilities
│   │   │   │   ├── __init__.py
│   │   │   │   ├── sitemap.py     # Sitemap generation
│   │   │   │   ├── schema.py      # Schema.org JSON-LD
│   │   │   │   └── robots.py      # Robots.txt
│   │   │   │
│   │   │   └── uploads/            # File storage
│   │   │       ├── __init__.py
│   │   │       ├── cv_storage.py  # CV file handling
│   │   │       └── image_storage.py
│   │   │
│   │   ├── admin/                  # Admin panel
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py       # Dashboard stats
│   │   │   └── approvals.py      # SPA/Job approvals
│   │   │
│   │   └── utils/                  # Utility functions
│   │       ├── __init__.py
│   │       ├── geo_utils.py       # Distance calculations
│   │       ├── seo_utils.py       # Slug generation, etc.
│   │       └── validators.py      # Phone, email validation
│   │
│   ├── migrations/                 # Database migrations (Alembic)
│   ├── requirements.txt            # Python dependencies
│   └── README.md
│
└── frontend/                        # Next.js Frontend
    ├── app/                         # Next.js App Router
    │   ├── layout.tsx              # Root layout
    │   ├── page.tsx                # Homepage
    │   ├── not-found.tsx           # 404 page
    │   ├── globals.css             # Global styles
    │   │
    │   ├── spa-near-me/            # Near me search
    │   │   └── page.tsx
    │   │
    │   ├── cities/                  # City-based pages
    │   │   └── [city]/             # Dynamic city route
    │   │       ├── page.tsx
    │   │       └── [area]/         # Dynamic area route
    │   │           └── page.tsx
    │   │
    │   ├── spas/                    # SPA pages
    │   │   └── [spa-slug]/         # Dynamic SPA route
    │   │       └── page.tsx
    │   │
    │   ├── jobs/                    # Job pages
    │   │   ├── page.tsx            # Jobs listing
    │   │   └── [job-slug]/         # Dynamic job route
    │   │       └── page.tsx
    │   │
    │   ├── apply/                   # Application pages
    │   │   └── [job-slug]/         # Dynamic apply route
    │   │       └── page.tsx
    │   │
    │   ├── messages/                # Messaging
    │   │   └── page.tsx
    │   │
    │   ├── analytics/               # Analytics
    │   │   └── track.tsx           # Client-side tracking
    │   │
    │   ├── api/                     # Next.js API routes
    │   │   └── track/              # Analytics proxy
    │   │       └── route.ts
    │   │
    │   └── sitemap.xml/             # Sitemap generation
    │       └── route.ts
    │
    ├── components/                  # React components
    │   ├── JobCard.tsx             # Job listing card
    │   ├── SpaCard.tsx             # SPA listing card
    │   ├── ApplyForm.tsx           # Application form
    │   ├── MessageForm.tsx         # Message form
    │   ├── LocationDetector.tsx    # Geolocation
    │   └── SeoHead.tsx             # SEO meta tags
    │
    ├── lib/                         # Utility libraries
    │   ├── api.ts                  # API client
    │   ├── geo.ts                  # Geographic utilities
    │   ├── analytics.ts            # Analytics tracking
    │   └── seo.ts                  # SEO utilities
    │
    ├── styles/                      # Additional styles
    ├── public/                      # Static files
    │   └── uploads/                # Uploaded files
    ├── next.config.js               # Next.js configuration
    ├── package.json                 # Node dependencies
    └── README.md
```

## 🎯 Key Features Implemented

### Backend
- ✅ Modular architecture with feature-based modules
- ✅ Location management (City, Area)
- ✅ SPA management with verification
- ✅ Job listings with SEO fields
- ✅ Application system (no login required)
- ✅ Direct messaging to SPAs
- ✅ Analytics tracking system
- ✅ SEO utilities (sitemap, schema.org)
- ✅ File upload handling (CVs, images)
- ✅ Admin dashboard utilities

### Frontend
- ✅ Next.js App Router structure
- ✅ Dynamic routes for cities, areas, spas, jobs
- ✅ SEO-optimized pages
- ✅ Location-based search
- ✅ Application forms
- ✅ Message forms
- ✅ Analytics tracking
- ✅ Sitemap generation

## 🚀 Next Steps

1. **Database Setup**: Configure PostgreSQL with PostGIS extension
2. **Environment Variables**: Set up `.env` files for both backend and frontend
3. **Database Migrations**: Run Alembic migrations to create tables
4. **API Integration**: Connect frontend to backend APIs
5. **UI/UX**: Build out the actual UI components
6. **Testing**: Add unit and integration tests

## 📝 Notes

- All modules follow a consistent structure: `models.py`, `schemas.py`, `services.py`, `routes.py`
- SEO fields are built into the Job model for manual control
- Analytics tracking is designed to work without user login
- File uploads are handled securely with validation
- Geographic search uses PostGIS for efficient location queries

