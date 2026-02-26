# 🎬 Shot Manager - Windows 一键安装包

## 📥 下载地址

**完整包（推荐）**：
包含 Node.js + 所有依赖，解压即用，无需安装任何环境。

下载：等待上传...

---

## 🚀 快速启动（3种方式）

### 方式一：双击启动（最简单）
1. 解压 `Shot-Manager-Windows.zip`
2. 双击 `双击启动.bat`
3. 自动打开浏览器，开始使用！

### 方式二：手动启动
```bash
cd shot-manager
start.bat
```

### 方式三：EXE 单文件版
双击 `Shot Manager.exe` 即可运行

---

## 📁 文件说明

```
shot-manager/
├── 双击启动.bat          # 🚀 推荐：一键启动
├── Shot Manager.exe      # 单文件版（备用）
├── start.bat             # 手动启动脚本
├── backend/
│   ├── server.js         # 后端服务
│   └── ...
├── frontend/
│   └── index.html        # 前端界面
├── assets/               # 上传的文件目录
└── shotmanager.db        # 数据库文件
```

---

## 🌐 访问地址

启动后访问：
- **本机**：http://localhost:3000
- **局域网**：http://[你的IP]:3000

---

## 💾 数据备份

数据库文件：`shotmanager.db`

备份方法：直接复制这个文件即可。

---

## 🔧 系统要求

- Windows 10 / Windows 11
- 无需安装 Node.js（已内置）
- 无需安装 Python（已内置）
- 端口 3000 和 3001 未被占用

---

## 🐛 常见问题

### Q1: 端口被占用？
编辑 `backend/server.js`，修改第 16 行的端口号。

### Q2: 防火墙提示？
允许 Node.js 通过防火墙即可。

### Q3: 其他电脑无法访问？
检查防火墙设置，确保端口 3000/3001 已开放。

---

## 📝 技术说明

- 后端：Node.js + Express + SQLite
- 前端：HTML5 + Tailwind CSS
- 数据库：SQLite（本地文件）
- 实时通信：WebSocket

---

**Made with ❤️ for filmmakers**
