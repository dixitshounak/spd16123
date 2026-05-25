@echo off
echo ================================
echo AI Trip Planner - Dev Server
echo ================================
echo.

echo Starting Backend Server (port 5000)...
start "AI Trip Planner - Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (port 5173)...
start "AI Trip Planner - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ========================================
echo Both servers are starting!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Health:   http://localhost:5000/api/health
echo ========================================
echo.

start "" "http://localhost:5173"
