@echo off
REM ============================================
REM CONSYF - Windows VPS Deployment Script
REM ============================================
REM Usage:
REM   First time:  deploy.bat setup
REM   Update code: deploy.bat
REM   Stop:        deploy.bat stop
REM ============================================

set ROOT_DIR=%~dp0
set BACK_DIR=%ROOT_DIR%backend
set FRONT_DIR=%ROOT_DIR%front-end

if "%1"=="setup" goto :setup
if "%1"=="stop" goto :stop
if "%1"=="status" goto :status
if "%1"=="logs" goto :logs
goto :deploy

REM ============================================
:setup
REM ============================================
echo [SETUP] === CONSYF Windows VPS Setup ===

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Download from: https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo [OK] Node.js %%i

REM Check MySQL
where mysql >nul 2>nul
if errorlevel 1 (
    echo [WARN] MySQL CLI not found in PATH
    echo Make sure MySQL is installed and running
)

REM Install PM2 globally
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [SETUP] Installing PM2...
    npm install -g pm2
)

REM Create backend .env if not exists
if not exist "%BACK_DIR%\.env" (
    copy "%BACK_DIR%\.env.example" "%BACK_DIR%\.env"
    echo [WARN] Created backend\.env from .env.example
    echo [WARN] EDIT backend\.env with your production values!
)

REM Create frontend .env.local if not exists
if not exist "%FRONT_DIR%\.env.local" (
    echo NEXT_PUBLIC_BACKEND_URL=http://YOUR_DOMAIN:4000> "%FRONT_DIR%\.env.local"
    echo [WARN] Created front-end\.env.local
    echo [WARN] EDIT front-end\.env.local with your domain!
)

REM Create logs directory
if not exist "%ROOT_DIR%logs" mkdir "%ROOT_DIR%logs"

echo.
echo [SETUP] === Setup complete ===
echo.
echo IMPORTANT - Edit these files:
echo   1. backend\.env          (MySQL password, JWT_SECRET, CORS_ORIGIN)
echo   2. front-end\.env.local  (NEXT_PUBLIC_BACKEND_URL)
echo.
echo Then run: deploy.bat
echo.
goto :deploy

REM ============================================
:deploy
REM ============================================
echo [DEPLOY] === Deploying CONSYF ===

REM Backend
echo [DEPLOY] Installing backend dependencies...
cd /d "%BACK_DIR%"
call npm install --omit=dev

echo [DEPLOY] Building backend...
call npm run build

REM Frontend
echo [DEPLOY] Installing frontend dependencies...
cd /d "%FRONT_DIR%"
call npm install

echo [DEPLOY] Building frontend (this may take a few minutes)...
call npm run build

REM Start with PM2
echo [DEPLOY] Starting services with PM2...
cd /d "%ROOT_DIR%"
pm2 describe consyf-backend >nul 2>nul
if errorlevel 1 (
    pm2 start ecosystem.config.cjs
) else (
    pm2 reload ecosystem.config.cjs
)
pm2 save

echo.
echo [DEPLOY] === DEPLOY COMPLETE ===
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:3000
echo.
echo   pm2 status    - Check services
echo   pm2 logs      - View logs
echo.
goto :eof

REM ============================================
:stop
REM ============================================
pm2 stop ecosystem.config.cjs
echo [OK] Services stopped
goto :eof

REM ============================================
:status
REM ============================================
pm2 status
goto :eof

REM ============================================
:logs
REM ============================================
pm2 logs
goto :eof
