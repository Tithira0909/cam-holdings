const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cam.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Admin',
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Admins table ready.');
        }
    });
}

// Wrapper to mimic mysql2 promise interface: await db.query(sql, params) -> [rows, fields]
// For SELECT, returns [rows, null]
// For INSERT/UPDATE, returns [{ insertId, affectedRows }, null]
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const trimmedSql = sql.trim().toUpperCase();
        if (trimmedSql.startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve([rows, []]);
            });
        } else {
            // Run for INSERT, UPDATE, DELETE
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
            });
        }
    });
};

module.exports = { query };
