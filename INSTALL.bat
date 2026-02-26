@echo off
title Shot Manager Installer

echo ==========================================
echo Shot Manager Installer
echo ==========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo Please install Node.js v20 from:
    echo https://nodejs.org/dist/v20.18.3/node-v20.18.3-x64.msi
    echo.
    pause
    exit /b 1
)

echo Node.js detected:
node --version
echo.

cd backend

echo Installing dependencies...
npm install

echo.
echo ==========================================
echo Installation complete
echo ==========================================
echo.
echo Now run RUN.bat to start
echo.
pause
