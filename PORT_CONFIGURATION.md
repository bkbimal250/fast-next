# Port Configuration - 8010

## Backend Server Port

The backend server is configured to run on **port 8010**.

### Starting the Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --port 8009

# Or using environment variable
PORT=8010 uvicorn app.main:app --reload

# Or set in .env file
PORT=8010
```

### Backend Configuration

The port can be configured in `backend/.env`:
```env
PORT=8010
```

Or use the default from `backend/app/core/config.py`:
```python
PORT: int = 8010  # Server port (default: 8010)
```

## Frontend API URL

The frontend is configured to connect to the backend on port 8010.

### Frontend Configuration

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8010
```

### Default Fallback

All frontend files have been updated to use `http://localhost:8010` as the default fallback if `NEXT_PUBLIC_API_URL` is not set.

## Updated Files

### Backend
- `backend/app/core/config.py` - Added PORT setting (default: 8010)

### Frontend
- All files with `API_URL` constants updated to use port 8010
- `frontend/next.config.js` - Updated image remote pattern port
- `frontend/.env.local` - Should be set to `http://localhost:8010`

### Documentation
- `ENV_CONFIGURATION.txt` - Updated to port 8010
- `ENV_FILES_SETUP.md` - Updated to port 8010

## Quick Start

1. **Backend**: Start server on port 8010
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8010
   ```

2. **Frontend**: Ensure `.env.local` has:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8010
   ```

3. **Verify**: Check API is accessible at `http://localhost:8010/api/docs`

## Notes

- The backend port is set to 8010 by default
- Frontend will automatically use port 8010 if `NEXT_PUBLIC_API_URL` is not set
- All API calls will now go to `http://localhost:8010`
- Image URLs will use port 8010 for localhost uploads

