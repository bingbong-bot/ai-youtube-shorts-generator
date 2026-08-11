# Setup and Installation Guide - AI YouTube Shorts Generator

## Prerequisites

- **Node.js**: v18 or higher ([download](https://nodejs.org/))
- **Python**: 3.10 or higher ([download](https://www.python.org/downloads/))
- **FFmpeg**: 4.4 or higher
  - **macOS**: `brew install ffmpeg`
  - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **Git**: For version control
- **Docker & Docker Compose** (optional): For containerized deployment

## Step 1: System Setup

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
ffmpeg -version  # Verify installation
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
ffmpeg -version
```

**Windows:**
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add to PATH: Right-click Computer → Properties → Environment Variables → Add `C:\ffmpeg\bin` to PATH

### Verify Node.js and Python

```bash
node --version  # Should be v18+
npm --version
python3 --version  # Should be 3.10+
```

## Step 2: Clone and Navigate

```bash
cd /Users/jyn/ai-youtube-shorts-generator
```

## Step 3: Backend Setup (Express.js)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required: OPENAI_API_KEY, DATABASE_URL, PORT
```

### Backend Environment Variables

Create `backend/.env`:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=./db/videos.sqlite
LOG_LEVEL=debug

# AI API Keys
OPENAI_API_KEY=sk-your-key-here
AI_SERVICE_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_UPLOAD_SIZE=52428800
TEMP_DIR=./uploads
```

## Step 4: AI Service Setup (FastAPI/Python)

```bash
cd ../ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your API keys
```

### AI Service Environment Variables

Create `ai-service/.env`:
```
OPENAI_API_KEY=sk-your-key-here
CLAUDE_API_KEY=sk-your-key-here
ENVIRONMENT=development
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

## Step 5: Frontend Setup (React)

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Frontend Environment Variables

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## Step 6: Database Setup

```bash
cd ../backend

# Initialize SQLite database
npm run db:init

# Run migrations (if any)
npm run db:migrate
```

## Running the Application

### Option 1: Manual Run (Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 - AI Service:**
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m app.main
# Service runs on http://localhost:8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000 (React dev server)
```

### Option 2: Docker Compose (Production-like)

```bash
# From project root
docker-compose up

# Services will start on:
# - Backend: http://localhost:3000
# - AI Service: http://localhost:8000
# - Frontend: http://localhost:3000
```

## Running Tests

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### AI Service Tests
```bash
cd ai-service
pytest                     # Run all tests
pytest -v                 # Verbose
pytest --cov             # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test                  # Interactive test runner
npm run test -- --coverage  # With coverage
```

## Building for Production

### Backend Build
```bash
cd backend
npm run build    # Compile TypeScript (if used)
npm run start    # Start production server
```

### AI Service Deployment
```bash
cd ai-service
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Frontend Build
```bash
cd frontend
npm run build   # Creates optimized build in build/
# Deploy contents of build/ folder to web server
```

## Verifying Installation

### Check Backend Connectivity
```bash
curl http://localhost:3000/api/health
# Should respond with: {"status": "ok"}
```

### Check AI Service
```bash
curl http://localhost:8000/health
# Should respond with: {"status": "ok"}
```

### Check Frontend
Open http://localhost:3000 in your browser

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### FFmpeg Not Found
Ensure FFmpeg is installed and in PATH:
```bash
which ffmpeg    # macOS/Linux
where ffmpeg    # Windows
```

### Python Dependencies Issue
```bash
cd ai-service
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Database Locked Error
```bash
cd backend
rm db/videos.sqlite
npm run db:init
```

### CORS Errors
Update CORS_ORIGIN in backend/.env to match your frontend URL.

## Directory Structure After Setup

```
ai-youtube-shorts-generator/
├── backend/
│   ├── db/                  # SQLite database
│   ├── uploads/             # Temporary uploads
│   ├── node_modules/
│   └── ...
├── ai-service/
│   ├── venv/               # Python virtual environment
│   └── ...
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── build/              # (After npm run build)
│   └── ...
└── docker-compose.yml
```

## Production Deployment

### Environment Considerations

1. **API Keys**: Store securely (AWS Secrets Manager, HashiCorp Vault)
2. **Database**: Use PostgreSQL instead of SQLite for production
3. **Storage**: Use S3 or similar for video storage instead of local disk
4. **Scaling**: Deploy backend and AI service as separate containers
5. **Monitoring**: Enable comprehensive logging and monitoring
6. **SSL/TLS**: Use HTTPS in production

### Deployment Steps

1. Set environment variables for production
2. Build Docker images: `docker build -t app-backend ./backend`
3. Push to registry (Docker Hub, ECR, etc.)
4. Deploy using orchestration tool (Kubernetes, Docker Swarm, etc.)
5. Set up CDN for frontend assets
6. Configure monitoring and alerting

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI API Docs](https://platform.openai.com/docs/)

## Support

For issues or questions:
1. Check logs: `tail -f logs/app.log`
2. Review error messages in browser console
3. Check backend/ai-service console output
4. Review relevant documentation above

---

**Last Updated**: August 2026
