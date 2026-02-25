# 🎬 Shot Manager - 本地影视镜头管理系统

一个仿 Shotgun/ShotGrid 的本地影视镜头管理系统，支持项目管理、镜头管理、资产管理、任务分配等功能。无需互联网，局域网内即可多人协作。

![Shot Manager](screenshot.png)

## ✨ 功能特性

### 📁 项目管理
- 创建多个影视项目
- 项目状态管理（进行中/已归档）
- 项目数据统计

### 🎥 镜头管理（Shot）
- 场次（Sequence）管理
- 镜头信息：名称、描述、帧范围、FPS
- 状态追踪：待开始 → 进行中 → 审核中 → 已完成
- 优先级设置（P1-P4）
- 按场次和状态筛选

### 🧊 资产管理（Asset）
- 角色、道具、场景分类
- 资产完成状态追踪
- 缩略图支持

### ✅ 任务管理
- 为镜头/资产分配任务
- 负责人指派
- 截止日期设置
- 任务完成状态追踪

### 👥 团队管理
- 人员信息管理
- 角色/部门设置

### 🔄 实时协作
- WebSocket 实时同步
- 多用户同时操作
- 数据变化即时通知

## 🚀 快速开始

### 环境要求
- Node.js 14+ 
- Python 3 (用于前端服务器)

### 安装启动

```bash
# 1. 进入项目目录
cd shot-manager

# 2. 启动服务（自动安装依赖并启动）
chmod +x start.sh
./start.sh
```

或者手动启动：

```bash
# 后端
cd backend
npm install
node server.js

# 前端（新终端）
cd frontend
python3 -m http.server 3000
```

### 访问系统

- **本机访问**: http://localhost:3000
- **局域网访问**: http://[你的IP]:3000
  - 查看本机IP: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)

## 📁 项目结构

```
shot-manager/
├── backend/
│   ├── server.js          # Express API 服务器
│   ├── package.json       # 依赖配置
│   └── ...
├── frontend/
│   ├── index.html         # 前端界面
│   └── ...
├── assets/
│   └── uploads/           # 上传的文件存储
├── shotmanager.db         # SQLite 数据库
└── start.sh               # 一键启动脚本
```

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express** - RESTful API
- **SQLite** - 本地数据库存储
- **WebSocket** - 实时通信
- **Multer** - 文件上传

### 前端
- **HTML5** + **Tailwind CSS** - 现代化界面
- **原生 JavaScript** - 无框架依赖
- **Font Awesome** - 图标库

### 数据库
- **SQLite** - 单文件数据库，无需配置

## 📊 数据模型

### 项目 (Project)
- ID, 名称, 描述, 状态, 创建时间

### 序列 (Sequence)
- ID, 项目ID, 名称, 描述

### 镜头 (Shot)
- ID, 项目ID, 序列ID, 名称, 描述
- 状态, 帧范围, FPS, 优先级, 缩略图

### 资产 (Asset)
- ID, 项目ID, 名称, 类型, 描述, 状态

### 任务 (Task)
- ID, 项目ID, 实体类型, 实体ID
- 名称, 负责人, 状态, 优先级, 截止日期

### 版本 (Version)
- ID, 项目ID, 实体类型, 实体ID
- 版本号, 文件路径, 描述, 创建人

### 人员 (People)
- ID, 姓名, 邮箱, 角色, 部门

## 🔌 API 接口

### 项目
- `GET    /api/projects` - 获取所有项目
- `POST   /api/projects` - 创建项目
- `GET    /api/projects/:id` - 获取单个项目
- `PUT    /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 镜头
- `GET    /api/projects/:id/shots` - 获取项目镜头
- `POST   /api/projects/:id/shots` - 创建镜头
- `PUT    /api/shots/:id` - 更新镜头

### 资产
- `GET    /api/projects/:id/assets` - 获取项目资产
- `POST   /api/projects/:id/assets` - 创建资产

### 任务
- `GET    /api/projects/:id/tasks` - 获取项目任务
- `POST   /api/projects/:id/tasks` - 创建任务
- `PUT    /api/tasks/:id` - 更新任务

### 统计
- `GET    /api/projects/:id/stats` - 获取项目统计

## 🎯 使用流程

1. **创建项目** - 点击"新建项目"，输入项目信息
2. **选择项目** - 点击项目卡片进入项目
3. **管理镜头** - 创建镜头，设置帧范围、状态
4. **分配任务** - 为镜头创建任务，指派负责人
5. **追踪进度** - 看板视图查看所有镜头状态

## 🔄 数据备份

数据库文件位置：`shotmanager.db`

备份方法：
```bash
# 复制数据库文件
cp shotmanager.db shotmanager_backup_$(date +%Y%m%d).db
```

## 🌐 局域网共享

### 查看本机IP
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### 其他设备访问
在同一局域网内的其他设备浏览器输入：
```
http://[你的IP]:3000
```

例如：http://192.168.1.100:3000

## 🚧 待开发功能

- [ ] 用户登录认证系统
- [ ] 文件版本管理
- [ ] 甘特图/时间线视图
- [ ] 评论和标注系统
- [ ] 与 UE/Unity 的实时链接
- [ ] 与 DCC 软件集成（Maya, Blender, Houdini）
- [ ] 渲染农场队列管理
- [ ] 多语言支持

## 📝 注意事项

1. **数据安全**: 本系统为本地使用，建议定期备份数据库
2. **文件存储**: 上传的文件保存在 `assets/uploads/` 目录
3. **并发访问**: 当前使用 SQLite，适合小团队（<20人）
4. **生产环境**: 如需更大规模使用，建议迁移到 PostgreSQL

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 自由使用和修改

---

Built with ❤️ for filmmakers and VFX artists.