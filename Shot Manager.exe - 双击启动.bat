@echo off
chcp 65001 >nul
title Shot Manager - 影视镜头管理系统
echo.
echo ╔══════════════════════════════════════════╗
echo ║       🎬 Shot Manager 启动器             ║
echo ║    本地影视镜头管理系统 v1.0.0           ║
echo ╚══════════════════════════════════════════╝
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

:: 启动 Shot Manager
echo 📦 启动 Shot Manager 服务...
start "Shot Manager" cmd /k "shot-manager.exe"

:: 等待服务启动
timeout /t 3 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════╗
echo ║ ✅ Shot Manager 启动成功！               ║
echo ╠══════════════════════════════════════════╣
echo ║ 本机访问: http://localhost:3000          ║
echo ║ 局域网访问: http://%LOCAL_IP%:3000       ║
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
