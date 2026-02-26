@echo off
REM ============================================
REM CONSYF - Stop All Services
REM ============================================

echo Stopping CONSYF services...

REM Kill node processes running on port 4000 and 80
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000.*LISTENING"') do (
    echo Stopping Backend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":80.*LISTENING"') do (
    echo Stopping Frontend (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] All services stopped.
pause
