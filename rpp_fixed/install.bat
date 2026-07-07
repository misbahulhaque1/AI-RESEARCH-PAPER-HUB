@echo off
echo ============================================
echo AI Research Paper Platform - Setup Script
echo ============================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend dependencies installation failed!
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependencies installation failed!
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Creating backend .env file...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Backend .env file created!
    echo Please edit backend\.env with your database credentials.
) else (
    echo Backend .env file already exists.
)
echo.

echo [4/4] Creating frontend .env file...
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Frontend .env file created!
) else (
    echo Frontend .env file already exists.
)
echo.

echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo NEXT STEPS:
echo 1. Edit backend\.env with your database credentials
echo 2. Create MySQL database: CREATE DATABASE research_papers;
echo 3. Start MySQL, MongoDB, Redis, and Elasticsearch services
echo 4. Run: npm run dev:backend (in one terminal)
echo 5. Run: npm run dev:frontend (in another terminal)
echo.
echo See QUICKSTART.md for detailed instructions.
echo.
pause
