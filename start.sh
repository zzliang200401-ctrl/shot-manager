#!/bin/bash

echo "🎬 Shot Manager - 影视镜头管理系统"
echo "===================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo "✅ 后端依赖安装完成"
echo ""

# 返回根目录
cd ..

# 启动后端服务器
echo "🚀 启动后端服务器..."
echo "   地址: http://localhost:3001"
echo ""
cd backend
node server.js &
SERVER_PID=$!
cd ..

# 等待服务器启动
sleep 2

# 启动前端（使用 Python 简单 HTTP 服务器）
echo "🌐 启动前端界面..."
echo "   地址: http://localhost:3000"
echo ""
cd frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!
cd ..

echo "===================================="
echo "✅ Shot Manager 已启动！"
echo ""
echo "📝 访问地址:"
echo "   前端界面: http://localhost:3000"
echo "   API 接口: http://localhost:3001"
echo ""
echo "🛑 停止服务:"
echo "   按 Ctrl+C 或运行: kill $SERVER_PID $FRONTEND_PID"
echo ""
echo "💡 局域网内其他设备访问:"
echo "   使用本机IP地址，如: http://$(hostname -I | awk '{print $1}'):3000"
echo "===================================="
echo ""

# 保持脚本运行
wait