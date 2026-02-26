@echo off
title Shot Manager Installer
echo.
echo ==========================================
echo     Shot Manager Installer
echo ==========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js v20:
    echo https://nodejs.org/dist/v20.18.3/node-v20.18.3-x64.msi
    echo.
    echo Note: Uninstall Node.js v24 first!
    echo.
    pause
    exit /b 1
)

echo Node.js found:
node --version
echo.

echo Entering project directory...
cd /d "%~dp0"
cd backend
echo.

echo Cleaning old dependencies...
if exist node_modules (
    rd /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)
echo.

echo Installing dependencies (this may take a few minutes)...
npm install
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
echo.

echo Installation complete!
echo.
echo Now you can start Shot Manager:
echo    Double-click "START.bat"
echo.

pause
