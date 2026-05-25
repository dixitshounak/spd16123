@echo off
echo ================================
echo AI Trip Planner - Setup Script
echo ================================
echo.

echo [1/2] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Server npm install failed!
    pause
    exit /b 1
)
echo Server dependencies installed!
echo.

echo [2/2] Installing client dependencies...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Client npm install failed!
    pause
    exit /b 1
)
echo Client dependencies installed!
echo.

echo ========================================
echo Setup complete! Now:
echo.
echo 1. Fill in server/.env (MongoDB, Gemini key, etc.)
echo 2. Fill in client/.env (Google Maps, Unsplash, OpenWeather)
echo 3. Run start-dev.bat to launch the app
echo ========================================
pause
