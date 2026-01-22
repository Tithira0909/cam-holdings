const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const dbPath = path.resolve(__dirname, 'cam.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

async function setup() {
    try {
        console.log('Setting up SQLite database...');

        // Users
        await run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'CLIENT',
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            is_active BOOLEAN DEFAULT 1,
            permissions TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Admin
        const hash = await bcrypt.hash('password123', 10);
        try {
            await run(`INSERT INTO users (username, password, role, email, first_name, last_name) VALUES (?, ?, 'ADMIN', 'admin@example.com', 'Super', 'Admin')`, ['admin', hash]);
            console.log('Admin user created');
        } catch (e) { console.log('Admin user likely exists'); }

        // Clients
        await run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE,
            contact_number TEXT,
            password_hash TEXT,
            status TEXT DEFAULT 'Active',
            is_approved BOOLEAN DEFAULT 0,
            role TEXT DEFAULT 'User',
            postal_code TEXT,
            site_address TEXT,
            correspondence_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reviews
        await run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            rating INTEGER,
            source TEXT,
            is_active BOOLEAN DEFAULT 0,
            is_published BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Service Listings
        await run(`CREATE TABLE IF NOT EXISTS service_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            estimated_cost TEXT,
            short_description TEXT,
            main_image TEXT,
            sub_images TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects
        await run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            location TEXT,
            budget TEXT,
            status TEXT DEFAULT 'Active',
            progress_status TEXT,
            description TEXT,
            image_url TEXT,
            main_image TEXT,
            slug TEXT,
            category TEXT,
            is_featured BOOLEAN DEFAULT 0,
            gallery_images TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Service Types (for completeness)
        await run(`CREATE TABLE IF NOT EXISTS service_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            slug TEXT,
            description TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Services
        await run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            service_type_id INTEGER,
            description TEXT,
            image_url TEXT,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('SQLite Setup Complete');
    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
}

setup();
