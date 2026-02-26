@echo off
chcp 65001 >nul
title Shot Manager - 一键安装脚本
echo.
echo ╔══════════════════════════════════════════╗
echo ║       🎬 Shot Manager 一键安装           ║
echo ╚══════════════════════════════════════════╝
echo.

:: 检查 Node.js
echo 🔍 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js！
    echo.
    echo 📥 请下载安装 Node.js v20：
    echo https://nodejs.org/dist/v20.18.3/node-v20.18.3-x64.msi
    echo.
    echo ⚠️  注意：必须先卸载 Node.js v24+ 再安装 v20
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version
echo.

:: 进入目录
echo 📂 进入项目目录...
cd /d "%~dp0"
cd backend
echo.

:: 删除旧依赖（如果有）
echo 🧹 清理旧依赖...
if exist node_modules (
    rd /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)
echo.

:: 安装依赖
echo 📦 安装依赖（可能需要几分钟）...
npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败！
    pause
    exit /b 1
)
echo.

echo ✅ 安装完成！
echo.
echo 🚀 现在可以启动 Shot Manager 了：
echo    双击 "双击启动.bat" 即可运行
echo.

pause
