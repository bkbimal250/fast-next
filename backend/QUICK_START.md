# Quick Start Guide - PostgreSQL

## ✅ Migration Complete

The `migrate_db.py` file has been removed because it was SQLite-specific. 
With PostgreSQL, **tables are created automatically** when you start the server.

## Steps to Start

### 1. Verify Environment Variables

Make sure your `backend/.env` file contains:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Spajobs@8989
POSTGRES_DB=spajobsindia
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=your-secret-key-change-this-in-production
SITE_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
pip install psycopg2-binary
```

### 3. Start the Server

```bash
# Default port is 8010 (configured in config.py)
uvicorn app.main:app --reload --port 8010

# Or set PORT in .env file
PORT=8010 uvicorn app.main:app --reload
```

**That's it!** The server will:
- ✅ Connect to PostgreSQL
- ✅ Automatically create all tables if they don't exist
- ✅ Set up connection pooling
- ✅ Be ready to handle requests

### 4. (Optional) Create Performance Indexes

After starting the server, you can optimize performance:

```bash
python create_indexes.py
```

## What Changed?

- ❌ **Removed**: `migrate_db.py` (SQLite migration script)
- ❌ **Removed**: `test_db.py` (SQLite test script)
- ❌ **Removed**: `check_messages.py` (SQLite utility)
- ✅ **Automatic**: Table creation on server startup
- ✅ **PostgreSQL**: Production-ready database

## Troubleshooting

### Error: "PostgreSQL settings are required"

Make sure your `.env` file has all required PostgreSQL variables.

### Error: "could not connect to server"

1. Check PostgreSQL is running: `pg_isready` (Linux/Mac) or check Windows services
2. Verify credentials in `.env` match your PostgreSQL setup
3. Check firewall settings if connecting to remote server

### Tables Not Created?

Check server logs for errors. The `init_db()` function runs automatically on startup.

## Need Help?

- See `POSTGRESQL_SETUP.md` for detailed setup instructions
- See `POSTGRESQL_MIGRATION_COMPLETE.md` for migration details

