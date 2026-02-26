@echo off
REM ============================================
REM CONSYF - Build All
REM Run this ONCE after git clone or git pull
REM ============================================

echo.
echo ========================================
echo   CONSYF - Building Project
echo ========================================
echo.

set ROOT_DIR=%~dp0

REM --- Backend ---
echo [1/3] Installing backend dependencies...
cd /d "%ROOT_DIR%backend"
call npm install
if errorlevel 1 (
    echo [ERROR] Backend npm install failed!
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM --- Frontend ---
echo [2/3] Installing frontend dependencies...
cd /d "%ROOT_DIR%front-end"
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend npm install failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Building frontend (this may take 1-3 minutes)...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Next step: run  start.bat
echo.
pause
