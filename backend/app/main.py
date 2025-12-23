"""
Main FastAPI application entry point
SPA Job Portal - Backend API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
import os

from app.core.database import init_db
from app.core.config import settings
from app.core.rate_limit import RateLimitMiddleware
from app.modules.users.routes import router as users_router
from app.modules.locations.routes import router as locations_router
from app.modules.spas.routes import router as spas_router
from app.modules.jobs.routes import router as jobs_router
from app.modules.applications.routes import router as applications_router
from app.modules.messages.routes import router as messages_router
from app.modules.analytics.routes import router as analytics_router
from app.modules.seo.routes import router as seo_router
from app.modules.subscribe.routes import router as subscribe_router
from app.modules.chatbot.routes import router as chatbot_router
from app.modules.contact.routes import router as contact_router


app = FastAPI(
    title="SPA Job Portal API",
    description="Location-intelligent, SEO-first SPA Job Portal Backend - Optimized for 1000+ concurrent users",
    version="1.0.0",
    docs_url="/api/docs" if settings.LOG_LEVEL == "DEBUG" else None,  # Disable docs in production
    redoc_url="/api/redoc" if settings.LOG_LEVEL == "DEBUG" else None,
)


# Compression middleware (reduces response size)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Rate limiting middleware (must be before CORS)
# Rate limits are automatically relaxed in DEBUG mode
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(RateLimitMiddleware)

# CORS middleware
# Allow localhost for development, production domain for production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://spajob.api.spajob.spajobs.co.in",  # Production domain with HTTPS
    "http://spajob.api.spajob.spajobs.co.in",   # Production domain with HTTP (if needed)
]

# In debug mode, allow all origins for easier development
if settings.LOG_LEVEL == "DEBUG":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create uploads directory before mounting (synchronous, runs at import time)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "spas"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "profiles"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "cvs"), exist_ok=True)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    init_db()


# Include routers
app.include_router(users_router)
app.include_router(locations_router)
app.include_router(spas_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(messages_router)
app.include_router(analytics_router)
app.include_router(seo_router)
app.include_router(subscribe_router)
app.include_router(chatbot_router)
app.include_router(contact_router)


@app.get("/")
async def root():
    return {"message": "SPA Job Portal API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

