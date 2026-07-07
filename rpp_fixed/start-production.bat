@echo off
echo ============================================
echo AI Research Paper Platform
echo Production-Ready Setup
echo ============================================
echo.

echo [Step 1/3] Checking database installations...
echo.
cd backend
call npm run setup-db
cd ..
echo.

echo ============================================
echo [Step 2/3] Installing dependencies...
echo ============================================
echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..
echo.

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo ============================================
echo [Step 3/3] Starting servers...
echo ============================================
echo.
echo Starting Backend Server...
start "Backend - Port 5000" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend - Port 5173" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo ✅ PLATFORM IS READY!
echo ============================================
echo.
echo 🌐 Access URLs:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:5000/api
echo.
echo 📚 Features:
echo    ✓ Upload research papers (PDF)
echo    ✓ Download papers with tracking
echo    ✓ Search by title, abstract, authors
echo    ✓ Filter by year, source, tags
echo    ✓ Sort by newest, most downloaded
echo    ✓ 1000+ papers pre-loaded
echo.
echo 🗄️  Database:
echo    MySQL: localhost:3306
echo    MongoDB: localhost:27017
echo    Redis: localhost:6379
echo.
echo 💡 Commands:
echo    npm run setup-db  - Check database installations
echo    npm run dev       - Start development servers
echo    npm run import:bulk - Import 1000+ research papers
echo.
pause
