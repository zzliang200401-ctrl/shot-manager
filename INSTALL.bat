@echo off
title Shot Manager - Windows Setup

echo ==========================================
echo Shot Manager Setup
echo ==========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo Please install Node.js v20
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

cd backend

echo Cleaning old files...
if exist node_modules (
    rd /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)
echo Done.
echo.

echo Installing dependencies for Windows...
echo This may take a few minutes...
echo.

call npm install --build-from-source

echo.
echo ==========================================
if errorlevel 1 (
    echo Installation failed
) else (
    echo Installation complete
    echo.
    echo Now run RUN.bat to start
)
echo ==========================================
echo.
pause
