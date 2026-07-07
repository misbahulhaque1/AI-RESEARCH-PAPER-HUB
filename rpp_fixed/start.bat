@echo off
echo ============================================
echo Starting AI Research Paper Platform
echo ============================================
echo.

echo [Step 1/4] Starting Docker Desktop...
echo Please wait for Docker Desktop to fully start...
echo.

start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting 30 seconds for Docker Desktop to initialize...
timeout /t 30 /nobreak >nul

echo.
echo [Step 2/4] Checking if Docker is ready...
:check_docker
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker not ready yet, waiting 10 more seconds...
    timeout /t 10 /nobreak >nul
    goto check_docker
)
echo Docker is ready!
echo.

echo [Step 3/4] Starting database services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start database services!
    pause
    exit /b 1
)
echo.
echo Database services started:
echo   - MySQL (port 3306)
echo   - MongoDB (port 27017)
echo   - Redis (port 6379)
echo   - Elasticsearch (port 9200)
echo.

echo Waiting 15 seconds for databases to initialize...
timeout /t 15 /nobreak >nul

echo [Step 4/4] Starting application servers...
echo.
echo ============================================
echo Starting Backend Server...
echo ============================================
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo Starting Frontend Server...
echo ============================================
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo Application Starting!
echo ============================================
echo.
echo Backend API: http://localhost:5000
echo Frontend UI: http://localhost:5173
echo.
echo Database Services:
echo   MySQL: localhost:3306
echo   MongoDB: localhost:27017
echo   Redis: localhost:6379
echo   Elasticsearch: localhost:9200
echo.
echo To stop databases: docker-compose down
echo.
pause
