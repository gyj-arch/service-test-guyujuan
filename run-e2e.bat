@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo ==========================================
echo   Kong Gateway Manager E2E Test Script
echo ==========================================

echo.
echo === 1. Git Pull ===
git pull
if errorlevel 1 (
  echo Error: git pull failed
  exit /b 1
)

echo.
echo === 2. Install npm dependencies ===
call npm ci
if errorlevel 1 (
  echo Error: npm ci failed
  exit /b 1
)

echo.
echo === 3. Start Kong (Docker) ===
cd docker
docker compose up -d
if errorlevel 1 (
  echo Error: Docker compose up failed. Ensure Docker Desktop is running.
  cd ..
  exit /b 1
)
cd ..

echo.
echo === 4. Wait for Kong to be ready ===
set count=0
:wait_kong
curl -s -f http://localhost:8001/status >nul 2>&1
if errorlevel 1 (
  set /a count+=1
  if !count! gtr 60 (
    echo Error: Kong startup timeout after 120 seconds
    set TEST_EXIT=1
    goto cleanup
  )
  echo   Waiting for Kong...
  timeout /t 2 /nobreak >nul
  goto wait_kong
)
echo Kong is ready

echo.
echo === 5. Run Cypress tests ===
call npm run cypress:run
set TEST_EXIT=%errorlevel%

:cleanup
echo.
echo === 6. Stop Docker services ===
cd docker
docker compose down
cd ..

exit /b %TEST_EXIT%
