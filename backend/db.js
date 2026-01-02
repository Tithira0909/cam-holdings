const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

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
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'client',
            phone TEXT,
            company TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Services Table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Resources Table
        db.run(`CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects Table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT,
            location TEXT,
            description TEXT,
            images TEXT, -- JSON string of image URLs
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reviews Table
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_name TEXT NOT NULL,
            rating INTEGER,
            comment TEXT,
            approved INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Inquiries Table
        db.run(`CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            message TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

         // Quotations Table
        db.run(`CREATE TABLE IF NOT EXISTS quotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            name TEXT,
            email TEXT,
            phone TEXT,
            service_type TEXT,
            budget_range TEXT,
            timeline TEXT,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            quoted_amount REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(client_id) REFERENCES users(id)
        )`);

        // Seed Default Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@camholdings.com';
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

        db.get("SELECT id FROM users WHERE email = ?", [adminEmail], async (err, row) => {
            if (err) return console.error(err.message);
            if (!row) {
                const hash = await bcrypt.hash(adminPass, 10);
                db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                    ['Super Admin', adminEmail, hash, 'admin'],
                    (err) => {
                        if (err) console.error("Error seeding admin:", err.message);
                        else console.log("Default admin seeded.");
                    }
                );
            }
        });
    });
}

// Promisify helper
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';
        db[method](sql, params, function(err, rows) {
            if (err) reject(err);
            else resolve(method === 'run' ? { insertId: this.lastID, changes: this.changes } : rows);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

module.exports = { db, query, get };
