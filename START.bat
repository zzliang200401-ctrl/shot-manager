@echo off
title Shot Manager

echo ==========================================
echo Shot Manager v1.0
echo ==========================================
echo.

echo Starting backend...
start cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start cmd /k "cd frontend && python -m http.server 3000"

timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo Server started
echo ==========================================
echo.
echo Open browser: http://localhost:3000
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:3000
