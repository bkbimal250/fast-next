# Production Deployment Guide

This guide helps you deploy the SPA Job Portal to handle 1000+ concurrent users.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Python 3.11+
- PostgreSQL 14+
- Redis 6+ (recommended)
- Nginx (for reverse proxy)
- Domain name with SSL certificate

## Step 1: Server Setup

### Install System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib redis-server nginx git
```

### Create Application User

```bash
sudo adduser --disabled-password --gecos "" spajobs
sudo su - spajobs
```

## Step 2: Database Setup

### Configure PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE spajobs;
CREATE USER spauser WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE spajobs TO spauser;
ALTER DATABASE spajobs SET timezone TO 'UTC';
\q
```

### Configure PostgreSQL for Performance

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
# Connection Settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Step 3: Redis Setup

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

## Step 4: Application Deployment

### Clone and Setup

```bash
cd /home/spajobs
git clone <your-repo-url> spajobs
cd spajobs/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_TYPE=postgresql
POSTGRES_USER=spauser
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=spajobs
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=300

# Security
SECRET_KEY=your-very-long-random-secret-key-here-generate-with-openssl-rand-hex-32
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/spajobs/app.log

# File Uploads
UPLOAD_DIR=/home/spajobs/spajobs/backend/uploads
MAX_UPLOAD_SIZE=10485760

# Site URL
SITE_URL=https://yourdomain.com
```

### Initialize Database

```bash
# Create database tables
python -c "from app.core.database import init_db; init_db()"

# Create indexes for performance
python create_indexes.py
```

## Step 5: Application Server (Gunicorn)

### Install Gunicorn

```bash
pip install gunicorn
```

### Create Systemd Service

Create `/etc/systemd/system/spajobs.service`:

```ini
[Unit]
Description=SPA Job Portal API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=spajobs
Group=spajobs
WorkingDirectory=/home/spajobs/spajobs/backend
Environment="PATH=/home/spajobs/spajobs/backend/venv/bin"
ExecStart=/home/spajobs/spajobs/backend/venv/bin/gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/spajobs/access.log \
    --error-logfile /var/log/spajobs/error.log \
    --log-level info

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Create Log Directory

```bash
sudo mkdir -p /var/log/spajobs
sudo chown spajobs:spajobs /var/log/spajobs
```

### Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable spajobs
sudo systemctl start spajobs
sudo systemctl status spajobs
```

## Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/spajobs`:

```nginx
# Upstream backend servers
upstream backend {
    least_conn;
    server 127.0.0.1:8000;
    # Add more servers for load balancing:
    # server 127.0.0.1:8001;
    # server 127.0.0.1:8002;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=2r/s;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # File upload size
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # Timeouts
    proxy_connect_timeout 75s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_http_version 1.1;
        
        # Caching for GET requests
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    }
    
    # File uploads with stricter rate limiting
    location /api/upload {
        limit_req zone=upload_limit burst=5 nodelay;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
    }
    
    # Serve static files directly
    location /uploads {
        alias /home/spajobs/spajobs/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check (no rate limiting)
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/spajobs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Monitoring

### Check Application Logs

```bash
sudo tail -f /var/log/spajobs/error.log
sudo tail -f /var/log/spajobs/access.log
```

### Monitor Database Connections

```sql
SELECT count(*) FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Monitor Redis

```bash
redis-cli info stats
redis-cli monitor  # Real-time monitoring
```

## Step 9: Performance Tuning

### Adjust Worker Count

The number of workers should be: `(2 × CPU cores) + 1`

For 4 CPU cores: `(2 × 4) + 1 = 9 workers`

Edit `/etc/systemd/system/spajobs.service`:
```ini
ExecStart=... --workers 9 ...
```

### Database Connection Pool

Adjust in `.env` if needed:
```env
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
```

## Step 10: Frontend Deployment

See `frontend/README.md` for Next.js deployment instructions.

## Scaling Beyond Single Server

1. **Horizontal Scaling**: Deploy multiple backend servers
2. **Load Balancer**: Use Nginx or AWS ELB
3. **Database Replication**: Set up PostgreSQL read replicas
4. **Redis Cluster**: For distributed caching
5. **CDN**: Use Cloudflare or AWS CloudFront for static assets

## Maintenance

### Database Maintenance

```sql
-- Run weekly
VACUUM ANALYZE;
REINDEX DATABASE spajobs;
```

### Clear Cache

```bash
redis-cli FLUSHDB
```

### Backup Database

```bash
pg_dump -U spauser spajobs > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### High Database Connections

Check active connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Slow Queries

Enable slow query logging in PostgreSQL and analyze.

### Memory Issues

Monitor with:
```bash
free -h
htop
```

### Application Crashes

Check logs:
```bash
sudo journalctl -u spajobs -f
```

