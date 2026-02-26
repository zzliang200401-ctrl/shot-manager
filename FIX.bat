@echo off
title Shot Manager - Windows Fix

echo ==========================================
echo Fixing Windows Compatibility
echo ==========================================
echo.

cd backend

echo Step 1: Removing old modules...
if exist node_modules (
    rd /s /q node_modules
)
del package-lock.json 2>nul
echo Done.
echo.

echo Step 2: Installing Windows-compatible version...
npm install better-sqlite3
npm install
echo.

echo Step 3: Rebuilding native modules...
npm rebuild better-sqlite3 --build-from-source
echo.

echo ==========================================
echo Fix complete
echo ==========================================
echo.
pause
