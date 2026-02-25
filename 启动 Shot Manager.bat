@echo off
chcp 65001 >nul
title Shot Manager - 影视镜头管理系统
echo.
echo ╔══════════════════════════════════════════╗
echo ║       🎬 Shot Manager 启动器             ║
echo ║    本地影视镜头管理系统 v1.0.0           ║
echo ╚══════════════════════════════════════════╝
echo.

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
echo.

:: 获取本机 IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo 🚀 正在启动 Shot Manager...
echo.

:: 启动后端
echo 📦 启动后端服务...
start "Shot Manager - 后端 API" cmd /k "cd /d "%~dp0backend" && node server.js"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端
echo 🌐 启动前端界面...
start "Shot Manager - 前端" cmd /k "cd /d "%~dp0frontend" && python -m http.server 3000"

:: 等待前端启动
timeout /t 2 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════╗
echo ║ ✅ Shot Manager 启动成功！               ║
echo ╠══════════════════════════════════════════╣
echo ║ 本机访问: http://localhost:3000          ║
echo ║ 局域网访问: http://%LOCAL_IP%:3000       ║
echo ╠══════════════════════════════════════════╣
echo ║ API 地址: http://localhost:3001          ║
echo ╚══════════════════════════════════════════╝
echo.
echo 💡 提示：
echo    - 本窗口可以关闭，服务会在后台运行
echo    - 关闭黑色命令窗口即可停止服务
echo    - 数据保存在 shotmanager.db 文件中
echo.

:: 自动打开浏览器
start http://localhost:3000

pause