@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

:: Show help if --help or -h is passed
if /i "%~1"=="--help" goto show_help
if /i "%~1"=="-h" goto show_help
goto skip_help

:show_help
echo ==========================================
echo   Kong Gateway Manager E2E Test Script
echo ==========================================
echo.
echo Usage:
echo   run-e2e.bat [OPTIONS]
echo.
echo Options:
echo   --spec ^<pattern^>    Cypress spec file or glob pattern to run
echo   --browser ^<name^>    Browser to use (chrome, firefox, edge, electron)
echo   --help, -h          Show this help message
echo.
echo Prerequisites:
echo   - Docker Desktop for Windows (running)
echo   - Node.js 18+
echo   - Git
echo.
echo Examples:
echo   REM Run all tests with default browser (Electron)
echo   run-e2e.bat
echo.
echo   REM Run a single spec file
echo   run-e2e.bat --spec "cypress/e2e/route/route_create.cy.js"
echo.
echo   REM Run all specs under a folder using glob
echo   run-e2e.bat --spec "cypress/e2e/route/*.cy.js"
echo.
echo   REM Run with Chrome browser
echo   run-e2e.bat --browser chrome
echo.
echo   REM Combine spec and browser
echo   run-e2e.bat --spec "cypress/e2e/service_route/*.cy.js" --browser edge
exit /b 0

:skip_help

echo ==========================================
echo   Kong Gateway Manager E2E Test Script
echo ==========================================

:: Parse arguments: --spec <file>, --browser <name>
set SPEC=
set BROWSER=

:parse_args
if "%~1"=="" goto end_parse
if /i "%~1"=="--spec" (set SPEC=%~2& shift& shift& goto parse_args)
if /i "%~1"=="--browser" (set BROWSER=%~2& shift& shift& goto parse_args)
shift
goto parse_args
:end_parse

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

:: Build cypress run command with optional --spec and --browser
echo.
echo === 5. Run Cypress tests ===
set CYPRESS_ARGS=
if not "%SPEC%"=="" set CYPRESS_ARGS=%CYPRESS_ARGS% --spec "%SPEC%"
if not "%BROWSER%"=="" set CYPRESS_ARGS=%CYPRESS_ARGS% --browser %BROWSER%
call npx cypress run %CYPRESS_ARGS%
set TEST_EXIT=%errorlevel%

:cleanup
echo.
echo === 6. Stop Docker services ===
cd docker
docker compose down
cd ..

exit /b %TEST_EXIT%
