# Scalability Guide - Handling 1000+ Concurrent Users

This guide outlines the optimizations and configurations needed to handle 1000+ concurrent users.

## ✅ Implemented Optimizations

### 1. Database Connection Pooling
- **PostgreSQL Connection Pool**: Configured with pool_size=20 and max_overflow=40 (total 60 connections)
- **Connection Recycling**: Connections are recycled after 1 hour to prevent stale connections
- **Pre-ping**: Connections are verified before use to handle network issues gracefully
- **Isolation Level**: Set to READ COMMITTED for better concurrency

### 2. Caching Layer
- **Redis Support**: Optional Redis caching for frequently accessed data
- **In-Memory Fallback**: Falls back to in-memory cache if Redis is unavailable
- **Cache Decorator**: Easy-to-use `@cache_result` decorator for caching function results
- **TTL Support**: Configurable cache expiration times

### 3. Rate Limiting
- **Per-IP Rate Limiting**: 60 requests per minute, 1000 requests per hour per IP
- **Middleware**: Automatic rate limiting on all API endpoints
- **Health Check Exclusion**: Health endpoints are excluded from rate limiting

### 4. Response Compression
- **GZip Middleware**: Automatic compression of responses > 1KB
- **Reduced Bandwidth**: Significantly reduces response sizes

## 📋 Required Setup for Production

### 1. Database (REQUIRED)
**PostgreSQL is required for production with 1000+ concurrent users.**

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE spajobs;
CREATE USER spauser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE spajobs TO spauser;
```

Update `.env`:
```env
DATABASE_TYPE=postgresql
POSTGRES_USER=spauser
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=spajobs
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 2. Redis (RECOMMENDED)
Redis significantly improves performance by caching frequently accessed data.

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

Update `.env`:
```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=300
```

### 3. Database Indexes
Ensure all frequently queried columns are indexed. Run this SQL:

```sql
-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_spa_id ON jobs(spa_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city_id ON jobs(city_id);
CREATE INDEX IF NOT EXISTS idx_jobs_state_id ON jobs(state_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_view_count ON jobs(view_count);

-- SPAs table indexes
CREATE INDEX IF NOT EXISTS idx_spas_city_id ON spas(city_id);
CREATE INDEX IF NOT EXISTS idx_spas_state_id ON spas(state_id);
CREATE INDEX IF NOT EXISTS idx_spas_is_active ON spas(is_active);
CREATE INDEX IF NOT EXISTS idx_spas_rating ON spas(rating);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### 4. Application Server Configuration

#### Using Uvicorn with Multiple Workers
```bash
# Production command (4 workers for 4 CPU cores)
uvicorn app.main:app --host 0.0.0.0 --port 8010 --workers 4 --log-level info
```

#### Using Gunicorn with Uvicorn Workers (Recommended)
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8010
```

### 5. Load Balancer (For Multiple Servers)
If running multiple backend servers, use a load balancer:

**Nginx Configuration** (`/etc/nginx/sites-available/spajobs`):
```nginx
upstream backend {
    least_conn;  # Use least connections algorithm
    server 127.0.0.1:8010;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Increase timeouts for large file uploads
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static files directly
    location /uploads {
        alias /path/to/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6. CDN for Static Assets (RECOMMENDED)
Use a CDN (Cloudflare, AWS CloudFront, etc.) for:
- Frontend static assets
- Uploaded images
- CSS/JS files

### 7. Environment Variables
Create `.env` file with production settings:

```env
# Database (REQUIRED)
DATABASE_TYPE=postgresql
POSTGRES_USER=spauser
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=spajobs
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis (RECOMMENDED)
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=300

# Security
SECRET_KEY=your-very-secure-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/spajobs/app.log

# CORS (Update with your domain)
# Allow only your frontend domain in production
```

## 🔧 Performance Monitoring

### 1. Database Monitoring
Monitor PostgreSQL connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

### 2. Application Monitoring
Use tools like:
- **Prometheus + Grafana**: For metrics
- **Sentry**: For error tracking
- **New Relic / Datadog**: For APM

### 3. Logging
Configure structured logging:
```python
import logging
from app.core.config import settings

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.LOG_FILE) if settings.LOG_FILE else logging.StreamHandler()
    ]
)
```

## 📊 Expected Performance

With these optimizations:
- **Concurrent Users**: 1000+ simultaneous users
- **Requests/Second**: 500-1000 RPS (depending on server hardware)
- **Response Time**: < 200ms for cached endpoints, < 500ms for database queries
- **Database Connections**: Efficiently managed with connection pooling

## 🚨 Important Notes

1. **PostgreSQL is required** for production with 1000+ users.
2. **Redis is highly recommended** for caching to reduce database load.
3. **Monitor your database connections** - adjust pool_size based on your server capacity.
4. **Use a load balancer** if you need to scale beyond a single server.
5. **Enable CDN** for static assets to reduce server load.
6. **Regular database maintenance** - VACUUM, ANALYZE, and index maintenance.

## 🔄 Scaling Beyond 1000 Users

If you need to handle more users:
1. **Horizontal Scaling**: Add more backend servers behind a load balancer
2. **Database Replication**: Use PostgreSQL read replicas for read-heavy operations
3. **Redis Cluster**: Use Redis cluster for distributed caching
4. **Background Jobs**: Use Celery for long-running tasks
5. **Message Queue**: Use RabbitMQ or Redis for task queues

