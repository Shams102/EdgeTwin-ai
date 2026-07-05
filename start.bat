@echo off
setlocal enabledelayedexpansion
title EdgeTwin AI - Launcher

echo.
echo  ================================================
echo    EdgeTwin AI - Full Stack Launcher
echo  ================================================
echo.

:: ── Set Java 21 ───────────────────────────────────────────
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: ── Paths ──────────────────────────────────────────────────
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "EDGE_AI=%ROOT%edge-ai"
set "FRONTEND=%ROOT%frontend"
set "JAR=%BACKEND%\target\edgetwin-backend-1.0.0.jar"

:: ── DB mode: use 'h2' if Docker not available ─────────────
set "DB_PROFILE=h2"
docker info >nul 2>&1
if not errorlevel 1 (
    set "DB_PROFILE=postgres"
    echo  [INFO] Docker detected - will use PostgreSQL
) else (
    echo  [INFO] Docker not running - using H2 in-memory database
)

echo.
echo  Checking prerequisites...

:: Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo  [!] Java not found at %JAVA_HOME%
    pause
    exit /b 1
)
echo  [OK] Java 21 found

:: Check JAR
if not exist "%JAR%" (
    echo  [!] Spring Boot JAR not found. Building now - please wait ~2 minutes...
    cd /d "%BACKEND%"
    call mvnw.cmd package -DskipTests -B
    if errorlevel 1 (
        echo  [!] Build failed.
        pause
        exit /b 1
    )
)
echo  [OK] Spring Boot JAR ready

echo.
echo  ================================================
echo    Starting Services (DB mode: %DB_PROFILE%)
echo  ================================================
echo.

:: ── 1. PostgreSQL (only if Docker is running) ─────────────
if "%DB_PROFILE%"=="postgres" (
    echo  [1/5] Starting PostgreSQL via Docker...
    start "PostgreSQL" cmd /k "title PostgreSQL ^& cd /d %ROOT% && docker-compose up db"
    echo       Waiting 12s for database...
    timeout /t 12 /nobreak > nul
    echo  [OK] PostgreSQL ready
) else (
    echo  [1/5] Skipping PostgreSQL ^(using H2 in-memory^)
)

:: ── 2. FastAPI Edge AI ─────────────────────────────────────
echo  [2/5] Starting FastAPI Edge AI...
start "FastAPI Edge AI" cmd /k "title FastAPI Edge AI ^& cd /d %EDGE_AI% && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo       Waiting 6s for model to load...
timeout /t 6 /nobreak > nul
echo  [OK] FastAPI at http://localhost:8000

:: ── 3. Spring Boot ─────────────────────────────────────────
echo  [3/5] Starting Spring Boot Backend...
if "%DB_PROFILE%"=="h2" (
    start "Spring Boot" cmd /k "title Spring Boot ^& cd /d %BACKEND% && java -jar %JAR% --spring.profiles.active=h2 --edge-ai.enabled=true"
) else (
    start "Spring Boot" cmd /k "title Spring Boot ^& cd /d %BACKEND% && java -jar %JAR% --edge-ai.enabled=true"
)
echo       Waiting 20s for Spring Boot to start...
timeout /t 20 /nobreak > nul
echo  [OK] Spring Boot at http://localhost:8080

:: ── 4. React Frontend ──────────────────────────────────────
echo  [4/5] Starting React Dashboard...
start "React Dashboard" cmd /k "title React Dashboard ^& cd /d %FRONTEND% && npm run dev"
echo       Waiting 6s for Vite to compile...
timeout /t 6 /nobreak > nul
echo  [OK] React at http://localhost:5173

:: ── 5. Sensor Simulator (optional — keeps seed health profiles stable) ──
echo  [5/5] Sensor Simulator skipped by default
echo       Run manually when you want live updates:
echo       python simulator.py --machines 6 --interval 2.5

echo.
echo  ================================================
echo    All services launched!
echo.
echo    Dashboard  : http://localhost:5173
echo    Backend    : http://localhost:8080/api/dashboard/summary
echo    FastAPI    : http://localhost:8000/docs
if "%DB_PROFILE%"=="h2" (
    echo    H2 Console : http://localhost:8080/h2-console
)
echo.
echo    Run stop.bat to shut everything down.
echo  ================================================
echo.

timeout /t 5 /nobreak > nul
start "" "http://localhost:5173"

pause
