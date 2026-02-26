const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, '../assets/uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(UPLOAD_DIR));

// 静态文件服务 - 前端
const FRONTEND_DIR = path.join(__dirname, '../frontend');
app.use(express.static(FRONTEND_DIR));

// API 路由前缀
const API_PREFIX = '/api';

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(UPLOAD_DIR, req.params.type || 'general');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// 初始化数据库
const db = new sqlite3.Database(path.join(__dirname, '../shotmanager.db'));

// 创建表
db.serialize(() => {
    // 项目表
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 序列/场次表
    db.run(`CREATE TABLE IF NOT EXISTS sequences (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 镜头表
    db.run(`CREATE TABLE IF NOT EXISTS shots (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        sequence_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        frame_start INTEGER,
        frame_end INTEGER,
        fps INTEGER DEFAULT 24,
        priority INTEGER DEFAULT 3,
        thumbnail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (sequence_id) REFERENCES sequences(id) ON DELETE CASCADE
    )`);

    // 资产表
    db.run(`CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT NOT NULL,
        type TEXT, -- character, prop, environment, etc.
        description TEXT,
        status TEXT DEFAULT 'pending',
        thumbnail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 任务表
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        entity_type TEXT, -- shot, asset
        entity_id TEXT,
        name TEXT NOT NULL,
        assignee TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 3,
        start_date DATE,
        due_date DATE,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 版本表
    db.run(`CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        entity_type TEXT, -- shot, asset
        entity_id TEXT,
        version_number INTEGER,
        description TEXT,
        file_path TEXT,
        thumbnail TEXT,
        status TEXT DEFAULT 'pending',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 注释/反馈表
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        entity_type TEXT,
        entity_id TEXT,
        content TEXT,
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 人员表
    db.run(`CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT, -- artist, supervisor, director, etc.
        department TEXT,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables initialized');
});

// WebSocket 广播函数
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// WebSocket 连接
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

// ============ 项目 API ============

// 获取所有项目
app.get('/api/projects', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY updated_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 创建项目
app.post('/api/projects', (req, res) => {
    const { name, description, status } = req.body;
    const id = uuidv4();
    
    db.run(
        'INSERT INTO projects (id, name, description, status) VALUES (?, ?, ?, ?)',
        [id, name, description, status || 'active'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'project_created', data: { id, name } });
            res.json({ id, name, description, status: status || 'active' });
        }
    );
});

// 获取单个项目
app.get('/api/projects/:id', (req, res) => {
    db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Project not found' });
        res.json(row);
    });
});

// 更新项目
app.put('/api/projects/:id', (req, res) => {
    const { name, description, status } = req.body;
    db.run(
        'UPDATE projects SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description, status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'project_updated', data: { id: req.params.id } });
            res.json({ success: true });
        }
    );
});

// 删除项目
app.delete('/api/projects/:id', (req, res) => {
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        broadcast({ type: 'project_deleted', data: { id: req.params.id } });
        res.json({ success: true });
    });
});

// ============ 序列 API ============

app.get('/api/projects/:projectId/sequences', (req, res) => {
    db.all('SELECT * FROM sequences WHERE project_id = ? ORDER BY name', [req.params.projectId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects/:projectId/sequences', (req, res) => {
    const { name, description } = req.body;
    const id = uuidv4();
    
    db.run(
        'INSERT INTO sequences (id, project_id, name, description) VALUES (?, ?, ?, ?)',
        [id, req.params.projectId, name, description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'sequence_created', data: { id, name, project_id: req.params.projectId } });
            res.json({ id, name, description });
        }
    );
});

// ============ 镜头 API ============

app.get('/api/projects/:projectId/shots', (req, res) => {
    const query = req.query.sequenceId 
        ? 'SELECT * FROM shots WHERE project_id = ? AND sequence_id = ? ORDER BY name'
        : 'SELECT * FROM shots WHERE project_id = ? ORDER BY name';
    const params = req.query.sequenceId 
        ? [req.params.projectId, req.query.sequenceId]
        : [req.params.projectId];
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects/:projectId/shots', (req, res) => {
    const { sequence_id, name, description, frame_start, frame_end, fps, priority } = req.body;
    const id = uuidv4();
    
    db.run(
        `INSERT INTO shots (id, project_id, sequence_id, name, description, frame_start, frame_end, fps, priority) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.params.projectId, sequence_id, name, description, frame_start, frame_end, fps || 24, priority || 3],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'shot_created', data: { id, name, project_id: req.params.projectId } });
            res.json({ id, name, description });
        }
    );
});

app.put('/api/shots/:id', (req, res) => {
    const { status, frame_start, frame_end, priority } = req.body;
    db.run(
        'UPDATE shots SET status = ?, frame_start = ?, frame_end = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, frame_start, frame_end, priority, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'shot_updated', data: { id: req.params.id, status } });
            res.json({ success: true });
        }
    );
});

// ============ 资产 API ============

app.get('/api/projects/:projectId/assets', (req, res) => {
    db.all('SELECT * FROM assets WHERE project_id = ? ORDER BY type, name', [req.params.projectId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects/:projectId/assets', (req, res) => {
    const { name, type, description } = req.body;
    const id = uuidv4();
    
    db.run(
        'INSERT INTO assets (id, project_id, name, type, description) VALUES (?, ?, ?, ?, ?)',
        [id, req.params.projectId, name, type, description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'asset_created', data: { id, name, type } });
            res.json({ id, name, type, description });
        }
    );
});

// ============ 任务 API ============

app.get('/api/projects/:projectId/tasks', (req, res) => {
    db.all('SELECT * FROM tasks WHERE project_id = ? ORDER BY due_date', [req.params.projectId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects/:projectId/tasks', (req, res) => {
    const { entity_type, entity_id, name, assignee, status, priority, due_date } = req.body;
    const id = uuidv4();
    
    db.run(
        `INSERT INTO tasks (id, project_id, entity_type, entity_id, name, assignee, status, priority, due_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.params.projectId, entity_type, entity_id, name, assignee, status || 'pending', priority || 3, due_date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'task_created', data: { id, name, assignee } });
            res.json({ id, name, assignee, status: status || 'pending' });
        }
    );
});

app.put('/api/tasks/:id', (req, res) => {
    const { status, assignee, due_date } = req.body;
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    db.run(
        'UPDATE tasks SET status = ?, assignee = ?, due_date = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, assignee, due_date, completedAt, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'task_updated', data: { id: req.params.id, status, assignee } });
            res.json({ success: true });
        }
    );
});

// ============ 版本 API ============

app.get('/api/versions', (req, res) => {
    const { entity_type, entity_id } = req.query;
    db.all(
        'SELECT * FROM versions WHERE entity_type = ? AND entity_id = ? ORDER BY version_number DESC',
        [entity_type, entity_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

app.post('/api/projects/:projectId/versions', upload.single('file'), (req, res) => {
    const { entity_type, entity_id, version_number, description, created_by } = req.body;
    const id = uuidv4();
    const filePath = req.file ? `/assets/${req.params.type || 'general'}/${req.file.filename}` : null;
    
    db.run(
        `INSERT INTO versions (id, project_id, entity_type, entity_id, version_number, description, file_path, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.params.projectId, entity_type, entity_id, version_number, description, filePath, created_by],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            broadcast({ type: 'version_created', data: { id, version_number, entity_id } });
            res.json({ id, version_number, file_path: filePath });
        }
    );
});

// ============ 人员 API ============

app.get('/api/people', (req, res) => {
    db.all('SELECT * FROM people ORDER BY name', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/people', (req, res) => {
    const { name, email, role, department } = req.body;
    const id = uuidv4();
    
    db.run(
        'INSERT INTO people (id, name, email, role, department) VALUES (?, ?, ?, ?, ?)',
        [id, name, email, role, department],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, name, email, role });
        }
    );
});

// ============ 统计 API ============

app.get('/api/projects/:projectId/stats', (req, res) => {
    const projectId = req.params.projectId;
    
    const stats = {};
    
    db.get('SELECT COUNT(*) as count FROM shots WHERE project_id = ?', [projectId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalShots = row.count;
        
        db.get("SELECT COUNT(*) as count FROM shots WHERE project_id = ? AND status = 'completed'", [projectId], (err, row) => {
            stats.completedShots = row.count;
            
            db.get('SELECT COUNT(*) as count FROM assets WHERE project_id = ?', [projectId], (err, row) => {
                stats.totalAssets = row.count;
                
                db.get('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?', [projectId], (err, row) => {
                    stats.totalTasks = row.count;
                    
                    db.get("SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = 'completed'", [projectId], (err, row) => {
                        stats.completedTasks = row.count;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// 前端路由 - 所有非 API 请求返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 Shot Manager Server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
    console.log(`🌐 WebSocket enabled for real-time updates`);
});

module.exports = { app, db };