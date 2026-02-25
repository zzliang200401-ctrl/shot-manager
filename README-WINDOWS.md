# 🎬 Shot Manager - Windows 一键运行版

本地影视镜头管理系统，仿 Shotgun/ShotGrid，支持项目管理、镜头管理、资产管理、任务分配等功能。**无需配置，双击即运行**。

## ✨ 功能特性

- 📁 **项目管理** - 创建多个影视项目
- 🎥 **镜头管理** - 场次、帧范围、状态追踪
- 🧊 **资产管理** - 角色、道具、场景分类
- ✅ **任务管理** - 分配任务、截止日期
- 👥 **团队管理** - 人员信息、角色权限
- 🔄 **实时协作** - WebSocket 多人同时操作
- 💾 **本地存储** - SQLite 数据库，数据安全

## 🚀 快速开始（Windows）

### 方法一：一键启动（推荐）

1. **双击运行** `启动 Shot Manager.bat`
2. 等待 3-5 秒，自动打开浏览器
3. 开始使用！

### 方法二：手动启动

打开两个命令行窗口：

```cmd
:: 窗口1 - 启动后端
cd backend
node server.js

:: 窗口2 - 启动前端
cd frontend
python -m http.server 3000
```

然后浏览器访问：http://localhost:3000

## 🌐 访问地址

| 方式 | 地址 |
|------|------|
| 本机访问 | http://localhost:3000 |
| 局域网访问 | http://[你的IP]:3000 |

查看本机IP：
- 按 `Win+R`，输入 `cmd`，回车
- 输入 `ipconfig`，查看 IPv4 地址

## 📁 文件说明

```
shot-manager/
├── 启动 Shot Manager.bat    # 🚀 一键启动脚本
├── backend/
│   ├── server.js            # 后端 API 服务
│   ├── node_modules/        # 依赖（已预装）
│   └── package.json         # 配置
├── frontend/
│   └── index.html           # 前端界面
├── assets/
│   └── uploads/             # 上传的文件
├── shotmanager.db           # 数据库文件
└── README.md                # 说明文档
```

## 🎯 使用流程

1. **创建项目** - 点击"新建项目"
2. **选择项目** - 点击项目卡片进入
3. **管理镜头** - 在"镜头管理"中添加镜头
4. **分配任务** - 在"任务列表"中创建任务
5. **追踪进度** - 看板视图查看状态

## 💾 数据备份

数据库文件位置：`shotmanager.db`

备份方法：直接复制这个文件到其他位置。

## 🔧 系统要求

- Windows 10 / Windows 11
- Node.js 14+ （如未安装会自动提示）
- Python 3 （Windows 10/11 已内置）

## 🛠️ 技术栈

- **后端**：Node.js + Express + SQLite
- **前端**：HTML5 + Tailwind CSS + JavaScript
- **实时通信**：WebSocket

## 📝 注意事项

1. **数据安全**：数据库保存在本地，建议定期备份
2. **多用户**：局域网内其他电脑可同时访问
3. **端口占用**：如果 3000/3001 端口被占用，需要修改端口
4. **防火墙**：首次运行可能需要允许防火墙通过

## 🐛 常见问题

### Q: 双击启动脚本没有反应？
A: 请确认已安装 Node.js，下载地址：https://nodejs.org

### Q: 提示端口被占用？
A: 修改 `启动 Shot Manager.bat` 中的端口号，或关闭占用端口的程序

### Q: 其他电脑无法访问？
A: 检查防火墙设置，确保允许 Node.js 和 Python 通过防火墙

### Q: 如何修改端口？
A: 编辑 `backend/server.js` 和启动脚本中的端口号

## 🔄 更新日志

### v1.0.0 (2024-02-25)
- ✅ 项目管理系统
- ✅ 镜头管理系统
- ✅ 资产管理系统
- ✅ 任务分配系统
- ✅ 实时协作功能
- ✅ Windows 一键启动

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 自由使用和修改

---

Built with ❤️ for filmmakers and VFX artists.
