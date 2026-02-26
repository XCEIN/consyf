@echo off
REM ============================================
REM CONSYF - Start Backend + Frontend
REM Run this AFTER build.bat
REM ============================================
REM This opens 2 separate CMD windows:
REM   - Backend  on port 4000
REM   - Frontend on port 3000
REM Close the windows to stop the services.
REM ============================================

echo.
echo ========================================
echo   CONSYF - Starting Services
echo ========================================
echo.

set ROOT_DIR=%~dp0

REM Check if frontend is built
if not exist "%ROOT_DIR%front-end\.next" (
    echo [ERROR] Frontend not built yet!
    echo Run build.bat first.
    pause
    exit /b 1
)

REM --- Start Backend in new window ---
echo [START] Backend on http://localhost:4000
start "CONSYF Backend" cmd /k "cd /d %ROOT_DIR%backend && node --import tsx src/server.ts"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak >nul

REM --- Start Frontend in new window ---
echo [START] Frontend on http://localhost:80
start "CONSYF Frontend" cmd /k "cd /d %ROOT_DIR%front-end && npx next start -p 80"

echo.
echo ========================================
echo   SERVICES STARTED!
echo ========================================
echo.
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:80 (domain: sitetest2026.io.vn)
echo.
echo   Two new CMD windows opened.
echo   Close them to stop the services.
echo.
echo   To stop both: run  stop.bat
echo.
pause
