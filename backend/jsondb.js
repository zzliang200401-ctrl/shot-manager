const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default database structure
const defaultDB = {
    projects: [],
    sequences: [],
    shots: [],
    assets: [],
    tasks: [],
    versions: [],
    notes: [],
    people: []
};

// Load database
function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading DB:', e);
    }
    return { ...defaultDB };
}

// Save database
function saveDB(db) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving DB:', e);
        return false;
    }
}

// Database object
const db = loadDB();

// Auto-save on exit
process.on('exit', () => saveDB(db));
process.on('SIGINT', () => { saveDB(db); process.exit(); });
process.on('SIGTERM', () => { saveDB(db); process.exit(); });

module.exports = { db, saveDB };
