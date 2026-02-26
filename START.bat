@echo off
title Shot Manager
echo.
echo ==========================================
echo     Shot Manager v1.0.0
echo ==========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo Starting Shot Manager...
echo.

echo Starting backend service...
start "Shot Manager Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Shot Manager Frontend" cmd /k "cd /d "%~dp0frontend" && python -m http.server 3000"

timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo     Shot Manager Started!
echo ==========================================
echo.
echo Local:    http://localhost:3000
echo Network:  http://%LOCAL_IP%:3000
echo.
echo Tips:
echo    - This window can be closed
echo    - Close the black CMD windows to stop
echo    - Data saved in shotmanager.db
echo.

start http://localhost:3000

pause
