# Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
Download from: https://nodejs.org/
Verify: `node --version` (should be v16+)

### 2. Install MySQL
Download from: https://dev.mysql.com/downloads/
Create database:
```sql
CREATE DATABASE research_papers;
```

### 3. Install MongoDB
Download from: https://www.mongodb.com/try/download/community
Verify: `mongosh` or `mongo`

### 4. Install Redis
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **Linux**: `sudo apt-get install redis-server`
- **Mac**: `brew install redis`
Verify: `redis-cli ping` (should return PONG)

### 5. Install Elasticsearch
Download from: https://www.elastic.co/downloads/elasticsearch
Verify: `curl http://localhost:9200`

## Setup Instructions

### Backend Setup

```bash
cd backend

# Install all dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your credentials
# Required minimum:
# - MYSQL_PASSWORD
# - JWT_SECRET
```

### Frontend Setup

```bash
cd frontend

# Install all dependencies
npm install

# Copy environment file
copy .env.example .env
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## First Time Setup

1. **Start both backend and frontend**
2. **Navigate to** http://localhost:5173
3. **Register a new account**
4. **Start exploring!**

## Optional Configurations

### Get Hugging Face Token (for AI features)
1. Go to https://huggingface.co/
2. Sign up for free account
3. Go to Settings > Access Tokens
4. Create new token
5. Add to backend .env: `HUGGINGFACE_API_TOKEN=your_token`

### Get Cloudinary Credentials (for PDF storage)
1. Go to https://cloudinary.com/
2. Sign up for free account
3. Get credentials from Dashboard
4. Add to backend .env:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Testing the Application

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Get Papers
```bash
curl http://localhost:5000/api/papers
```

## Common Issues

### MySQL Connection Error
- Check if MySQL service is running
- Verify credentials in .env
- Ensure database `research_papers` exists

### MongoDB Connection Error
- Check if MongoDB service is running
- Verify MONGODB_URI in .env

### Redis Connection Error
- Check if Redis is running: `redis-cli ping`
- Verify REDIS_URL in .env

### Elasticsearch Connection Error
- Check if Elasticsearch is running
- App will still work without Elasticsearch (fallback to MySQL search)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env if needed
```

## Next Steps

1. Add sample research papers through the UI
2. Test search functionality
3. Try AI summary generation (requires Hugging Face token)
4. Save papers and view recommendations
5. Explore analytics dashboard

## Support

For issues or questions, refer to the main README.md file.
