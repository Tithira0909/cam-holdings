const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  try {
    // Connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database '${process.env.DB_NAME}' created or already exists.`);

    await connection.end();

    // Now connect to the database to create tables
    const db = require('./db');
    const bcrypt = require('bcrypt');

    // Create Users Table (Updated Schema)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'CLIENT') DEFAULT 'CLIENT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        permissions TEXT
      )
    `);

    // Migration for Users Table
    const userMigrationQueries = [
        "ALTER TABLE users ADD COLUMN first_name VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN last_name VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE",
        "ALTER TABLE users ADD COLUMN phone VARCHAR(20)",
        "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
        "ALTER TABLE users ADD COLUMN permissions TEXT"
    ];

    for (const query of userMigrationQueries) {
        try {
            await db.query(query);
        } catch (error) {
             if (error.errno !== 1060 && error.errno !== 1061) { // 1060: Duplicate column, 1061: Duplicate key
                 // console.log(`Migration note: ${error.message}`);
            }
        }
    }
    console.log('Users table created or updated.');

    // Create Projects Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Projects table created or already exists.');

    // Create Clients Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        postal_code VARCHAR(20),
        site_address TEXT,
        correspondence_address TEXT,
        contact_number VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'Active',
        is_approved BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'User'
      )
    `);

    // Migration for Clients Table
    const clientMigrationQueries = [
        "ALTER TABLE clients ADD COLUMN status VARCHAR(20) DEFAULT 'Active'",
        "ALTER TABLE clients ADD COLUMN is_approved BOOLEAN DEFAULT FALSE",
        "ALTER TABLE clients ADD COLUMN role VARCHAR(20) DEFAULT 'User'",
        // Ensure all columns are present (robustness fix)
        "ALTER TABLE clients ADD COLUMN postal_code VARCHAR(20)",
        "ALTER TABLE clients ADD COLUMN site_address TEXT",
        "ALTER TABLE clients ADD COLUMN correspondence_address TEXT",
        "ALTER TABLE clients ADD COLUMN contact_number VARCHAR(20)"
    ];

    for (const query of clientMigrationQueries) {
        try {
            await db.query(query);
        } catch (error) {
            if (error.errno !== 1060) {
                 // console.log(`Migration note: ${error.message}`);
            }
        }
    }
    console.log('Clients table created or updated.');

    // Create Service Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(255),
        banner VARCHAR(255),
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Service Types table created or already exists.');

    // Create Services Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        service_type_id INT,
        description TEXT,
        image_url VARCHAR(255),
        status ENUM('published', 'draft') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL
      )
    `);
    console.log('Services table created or already exists.');

    // Add initial admin user if not exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      // Ensure email is set for the default admin
      await db.query('INSERT INTO users (username, password, role, email, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'ADMIN', 'admin@example.com', 'Super', 'Admin', true]);
      console.log('Default admin user created: admin / password123');
    } else {
        // Update default admin to have email if missing (Optional fix)
        // await db.query("UPDATE users SET email='admin@example.com', first_name='Super', last_name='Admin' WHERE username='admin' AND email IS NULL");
        console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupDatabase();
