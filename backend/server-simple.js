const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db, saveDB } = require('./jsondb');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, '../assets/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(UPLOAD_DIR));

// Static files - frontend
const FRONTEND_DIR = path.join(__dirname, '../frontend');
app.use(express.static(FRONTEND_DIR));

// File upload config
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

// ============ PROJECTS API ============
app.get('/api/projects', (req, res) => {
    res.json(db.projects.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
});

app.post('/api/projects', (req, res) => {
    const { name, description, status } = req.body;
    const id = uuidv4();
    const project = { 
        id, name, description, 
        status: status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    db.projects.push(project);
    saveDB(db);
    res.json(project);
});

app.get('/api/projects/:id', (req, res) => {
    const project = db.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const idx = db.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });
    
    db.projects[idx] = { ...db.projects[idx], ...req.body, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/projects/:id', (req, res) => {
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    db.sequences = db.sequences.filter(s => s.project_id !== req.params.id);
    db.shots = db.shots.filter(s => s.project_id !== req.params.id);
    db.assets = db.assets.filter(a => a.project_id !== req.params.id);
    db.tasks = db.tasks.filter(t => t.project_id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ============ SEQUENCES API ============
app.get('/api/projects/:projectId/sequences', (req, res) => {
    const sequences = db.sequences.filter(s => s.project_id === req.params.projectId);
    res.json(sequences.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/projects/:projectId/sequences', (req, res) => {
    const { name, description } = req.body;
    const id = uuidv4();
    const sequence = {
        id, project_id: req.params.projectId, name, description,
        created_at: new Date().toISOString()
    };
    db.sequences.push(sequence);
    saveDB(db);
    res.json(sequence);
});

// ============ SHOTS API ============
app.get('/api/projects/:projectId/shots', (req, res) => {
    let shots = db.shots.filter(s => s.project_id === req.params.projectId);
    if (req.query.sequence_id) {
        shots = shots.filter(s => s.sequence_id === req.query.sequence_id);
    }
    res.json(shots);
});

app.post('/api/projects/:projectId/shots', (req, res) => {
    const { name, description, status, frame_start, frame_end, fps, priority, sequence_id } = req.body;
    const id = uuidv4();
    const shot = {
        id, project_id: req.params.projectId, sequence_id,
        name, description, status: status || 'pending',
        frame_start, frame_end, fps: fps || 24, priority: priority || 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    db.shots.push(shot);
    saveDB(db);
    res.json(shot);
});

app.put('/api/shots/:id', (req, res) => {
    const idx = db.shots.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Shot not found' });
    
    db.shots[idx] = { ...db.shots[idx], ...req.body, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/shots/:id', (req, res) => {
    db.shots = db.shots.filter(s => s.id !== req.params.id);
    db.tasks = db.tasks.filter(t => t.entity_id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ============ ASSETS API ============
app.get('/api/projects/:projectId/assets', (req, res) => {
    const assets = db.assets.filter(a => a.project_id === req.params.projectId);
    res.json(assets);
});

app.post('/api/projects/:projectId/assets', (req, res) => {
    const { name, type, description, status } = req.body;
    const id = uuidv4();
    const asset = {
        id, project_id: req.params.projectId,
        name, type, description, status: status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    db.assets.push(asset);
    saveDB(db);
    res.json(asset);
});

app.put('/api/assets/:id', (req, res) => {
    const idx = db.assets.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Asset not found' });
    
    db.assets[idx] = { ...db.assets[idx], ...req.body, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

// ============ TASKS API ============
app.get('/api/projects/:projectId/tasks', (req, res) => {
    const tasks = db.tasks.filter(t => t.project_id === req.params.projectId);
    res.json(tasks);
});

app.post('/api/projects/:projectId/tasks', (req, res) => {
    const { entity_type, entity_id, name, assignee, status, priority, start_date, due_date } = req.body;
    const id = uuidv4();
    const task = {
        id, project_id: req.params.projectId, entity_type, entity_id,
        name, assignee, status: status || 'pending', priority: priority || 3,
        start_date, due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    db.tasks.push(task);
    saveDB(db);
    res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const idx = db.tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    
    db.tasks[idx] = { ...db.tasks[idx], ...req.body, updated_at: new Date().toISOString() };
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
    db.tasks = db.tasks.filter(t => t.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ============ PEOPLE API ============
app.get('/api/people', (req, res) => {
    res.json(db.people.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/people', (req, res) => {
    const { name, email, role, department } = req.body;
    const id = uuidv4();
    const person = {
        id, name, email, role, department,
        created_at: new Date().toISOString()
    };
    db.people.push(person);
    saveDB(db);
    res.json(person);
});

// ============ STATS API ============
app.get('/api/projects/:projectId/stats', (req, res) => {
    const projectId = req.params.projectId;
    const stats = {
        totalShots: db.shots.filter(s => s.project_id === projectId).length,
        completedShots: db.shots.filter(s => s.project_id === projectId && s.status === 'completed').length,
        totalAssets: db.assets.filter(a => a.project_id === projectId).length,
        totalTasks: db.tasks.filter(t => t.project_id === projectId).length,
        completedTasks: db.tasks.filter(t => t.project_id === projectId && t.status === 'completed').length
    };
    res.json(stats);
});

// Frontend fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shot Manager running at http://localhost:${PORT}`);
    console.log(`Data saved to: ${DB_FILE}`);
});
