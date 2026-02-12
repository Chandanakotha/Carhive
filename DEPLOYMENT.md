#  Carhivee Deployment Guide

This guide covers deploying Carvia in various environments.

---

## Prerequisites

- **Python 3.10+**
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL** (for production) or SQLite (for development)
- **Modern web browser**

---

##  Quick Start (Local Development)

### Option 1: Manual Setup

#### 1. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize the database with seed data
python reset_database.py

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be running at:** `https://carhive.onrender.com/api/v1`
**API Documentation:** `https://carhive.onrender.com/api/v1/docs`

#### 2. Launch the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Option A: Use Python's built-in server
python -m http.server 5500

# Option B: Use VS Code Live Server extension
# Right-click on index.html → "Open with Live Server"

# Option C: Simply open index.html in your browser
```

**Frontend will be accessible at:** `http://localhost:5500` (or your chosen port)

---

### Option 2: Docker Deployment (Recommended)

```bash
# From the project root directory
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

**Services:**
- **Backend API:** `https://carhive.onrender.com/api/v1`
- **Frontend:** `http://localhost:80`

**Stop services:**
```bash
docker-compose down
```

---

##  Production Deployment

### Backend Deployment (FastAPI)

#### Option 1: Deploy to Render/Railway/Fly.io

1. **Create a `Procfile`** (if not using Docker):
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

2. **Set Environment Variables:**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-secret-key-here
```

3. **Deploy:**
   - Connect your GitHub repository
   - Set the root directory to `backend`
   - Deploy!

#### Option 2: Deploy with Docker

Use the provided `Dockerfile` in the `backend` directory:

```bash
docker build -t carvia-backend ./backend
docker run -p 8000:8000 carvia-backend
```

---

### Frontend Deployment

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. **Build/Prepare:**
   - No build step needed (vanilla HTML/CSS/JS)
   - Just upload the `frontend` folder

2. **Configure API URL:**
   - Update `frontend/js/main.js`
   - Change `API_BASE_URL` to your production backend URL

3. **Deploy:**
   - Drag and drop the `frontend` folder to Netlify/Vercel
   - Or push to GitHub and connect to GitHub Pages

#### Option 2: Nginx Server

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/carvia/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass https://carhive.onrender.com/api/v1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

##  Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (use `.env.example` as template):

```env
# Database
DATABASE_URL=sqlite:///./carvia.db  # Development
# DATABASE_URL=postgresql://user:password@host:5432/carvia  # Production

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (adjust for production)
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:3000
```

### Frontend Configuration

Update `frontend/js/main.js`:

```javascript
// Development
const API_BASE_URL = 'https://carhive.onrender.com/api/v1';

// Production
const API_BASE_URL = 'https://your-backend-domain.com';
```

---

##  Database Setup

### Development (SQLite)
```bash
cd backend
python reset_database.py
```

### Production (PostgreSQL)

1. **Create Database:**
```sql
CREATE DATABASE carvia;
CREATE USER carvia_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE carvia TO carvia_user;
```

2. **Update `.env`:**
```env
DATABASE_URL=postgresql://carvia_user:secure_password@localhost:5432/carvia
```

3. **Initialize:**
```bash
cd backend
python reset_database.py
```

---

##  Testing the Deployment

### 1. Test Backend API
```bash
# Check health
curl https://carhive.onrender.com/api/v1/

# Get all cars
curl https://carhive.onrender.com/api/v1/cars/

# View API docs
open https://carhive.onrender.com/api/v1/docs
```

### 2. Test Frontend
- Open the frontend URL in your browser
- Try browsing cars (should work without login)
- Register a new account
- Login and try adding a car
- Test editing and deleting cars

---

##  Troubleshooting

### Backend Issues

**Problem:** Database connection errors
```bash
# Solution: Reset the database
cd backend
python reset_database.py
```

**Problem:** Module not found errors
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem:** Port already in use
```bash
# Solution: Change the port
uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

**Problem:** Cannot connect to backend
- **Check:** Is the backend running? Visit `https://carhive.onrender.com/api/v1/docs`
- **Check:** Is the API_BASE_URL correct in `frontend/js/main.js`?
- **Check:** CORS settings in `backend/app/main.py`

**Problem:** Cars not displaying
- **Check:** Browser console for errors (F12)
- **Check:** Network tab to see API responses
- **Clear:** Browser cache and localStorage

---

##  Monitoring & Logs

### View Backend Logs
```bash
# If running with uvicorn
# Logs appear in the terminal

# If running with Docker
docker-compose logs -f backend
```

### Database Inspection
```bash
# SQLite
cd backend
sqlite3 carvia.db
.tables
SELECT * FROM cars;

# PostgreSQL
psql -U carvia_user -d carvia
\dt
SELECT * FROM cars;
```

---

##  Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` in `.env` to a strong random value
- [ ] Update `ALLOWED_ORIGINS` to only include your frontend domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up proper authentication and authorization
- [ ] Add rate limiting to API endpoints
- [ ] Sanitize user inputs
- [ ] Add logging and monitoring
- [ ] Set up automated backups for the database

---

##  Scaling Considerations

### Backend Scaling
- Use Gunicorn with multiple workers:
  ```bash
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
  ```
- Deploy behind a load balancer
- Use Redis for caching
- Implement database connection pooling

### Frontend Scaling
- Use a CDN for static assets
- Implement lazy loading for images
- Add service workers for offline support
- Minify CSS and JavaScript

---

##  Support

If you encounter issues:

1. Check the logs (backend terminal or Docker logs)
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Try a fresh database reset
5. Clear browser cache and localStorage

---

##  Notes

- **Default Admin Account:** Created during database initialization (check `reset_database.py`)
- **Sample Data:** The database is seeded with sample cars for testing
- **File Uploads:** Car images are stored as base64 in the database (consider using cloud storage for production)

---


