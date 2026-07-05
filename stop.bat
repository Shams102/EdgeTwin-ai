@echo off
echo ================================================
echo   EdgeTwin AI - Stopping All Services
echo ================================================
echo.

echo Stopping Docker services...
cd /d "%~dp0"
docker-compose down

echo Killing Node (React)...
taskkill /F /IM node.exe /T 2>nul

echo Killing Python (FastAPI + Simulator)...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul

echo Killing Java (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo All services stopped.
pause
