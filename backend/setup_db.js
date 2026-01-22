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
        location VARCHAR(255),
        budget VARCHAR(255),
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        progress_status VARCHAR(255) DEFAULT 'Not Started',
        description TEXT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for Projects Table
    const projectMigrationQueries = [
        "ALTER TABLE projects ADD COLUMN location VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN budget VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN status ENUM('Active', 'Inactive') DEFAULT 'Active'",
        "ALTER TABLE projects ADD COLUMN progress_status VARCHAR(255) DEFAULT 'Not Started'",
        "ALTER TABLE projects ADD COLUMN client_id INT",
        "ALTER TABLE projects ADD COLUMN slug VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN description_html TEXT",
        "ALTER TABLE projects ADD COLUMN service_id INT",
        "ALTER TABLE projects ADD COLUMN project_status VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN quotation_id INT",
        "ALTER TABLE projects ADD COLUMN property_extensions TEXT",
        "ALTER TABLE projects ADD COLUMN start_date DATE",
        "ALTER TABLE projects ADD COLUMN end_date DATE",
        "ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT FALSE",
        "ALTER TABLE projects ADD COLUMN drawing_url VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN project_file_url VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN thumbnail_image VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN main_image VARCHAR(255)",
        "ALTER TABLE projects ADD COLUMN gallery_images JSON"
    ];

    for (const query of projectMigrationQueries) {
        try {
            await db.query(query);
        } catch (error) {
             if (error.errno !== 1060) { // 1060: Duplicate column
                 // console.log(`Migration note: ${error.message}`);
            }
        }
    }
    console.log('Projects table created or updated.');

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

    // Create Reviews Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        message TEXT,
        rating INT DEFAULT 5,
        source VARCHAR(50) DEFAULT 'Google',
        is_active BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for Reviews Table
    const reviewMigrationQueries = [
        "ALTER TABLE reviews CHANGE COLUMN client_name name VARCHAR(255) NOT NULL",
        "ALTER TABLE reviews CHANGE COLUMN description message TEXT",
        "ALTER TABLE reviews ADD COLUMN email VARCHAR(255)",
        "ALTER TABLE reviews ADD COLUMN is_active BOOLEAN DEFAULT FALSE",
        "ALTER TABLE reviews ADD COLUMN is_published BOOLEAN DEFAULT FALSE",
        "ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];

    for (const query of reviewMigrationQueries) {
        try {
            await db.query(query);
        } catch (error) {
             if (error.errno !== 1060 && error.errno !== 1054) { // 1060: Duplicate column, 1054: Unknown column (if renaming already done)
                 // console.log(`Migration note: ${error.message}`);
            }
        }
    }
    console.log('Reviews table created or updated.');

    // Create Inquiries Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Inquiries table created or already exists.');

    // Create Quotations Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        contact VARCHAR(20),
        type ENUM('Quotation', 'Booking') DEFAULT 'Quotation',
        date DATE,
        time TIME,
        details_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration for Quotations Table
    const quoteMigrationQueries = [
        "ALTER TABLE quotations ADD COLUMN property_design_id INT"
    ];
    for (const query of quoteMigrationQueries) {
        try {
            await db.query(query);
        } catch (error) {
             if (error.errno !== 1060) {}
        }
    }
    console.log('Quotations table created or already exists.');

    // Create Document Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(255) DEFAULT 'Project Document',
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Document Types table created or already exists.');

    // Create Project Tasks Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Project Tasks table created or already exists.');

    // Create Blogs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255) DEFAULT 'News Content',
        title VARCHAR(255) NOT NULL,
        banner_url VARCHAR(255),
        featured_image_url VARCHAR(255),
        gallery_json TEXT,
        content_html TEXT,
        published_status ENUM('Published', 'Unpublished') DEFAULT 'Unpublished',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Blogs table created or already exists.');

    // Quotation Settings Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_parts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_part_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        part_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (part_id) REFERENCES property_parts(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_service_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES property_services(id) ON DELETE SET NULL
      )
    `);
    console.log('Quotation Settings tables created or already exists.');

    // --- New Settings Tables ---

    // Roles (Permission Settings)
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        permissions TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Roles table created or already exists.');

    // Analytics Settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_analytics_id VARCHAR(255),
        facebook_pixel_id VARCHAR(255),
        custom_header_scripts TEXT,
        custom_footer_scripts TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Analytics Settings table created or already exists.');

    // Site Settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_title VARCHAR(255),
        site_tagline VARCHAR(255),
        site_email VARCHAR(255),
        contact_phone VARCHAR(255),
        address TEXT,
        logo_url VARCHAR(255),
        favicon_url VARCHAR(255),
        maintenance_mode BOOLEAN DEFAULT FALSE,
        social_facebook VARCHAR(255),
        social_twitter VARCHAR(255),
        social_instagram VARCHAR(255),
        social_linkedin VARCHAR(255),
        social_youtube VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Site Settings table created or already exists.');

    // Email Settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mail_driver VARCHAR(50) DEFAULT 'smtp',
        mail_host VARCHAR(255),
        mail_port VARCHAR(50),
        mail_username VARCHAR(255),
        mail_password VARCHAR(255),
        mail_encryption VARCHAR(50) DEFAULT 'tls',
        from_address VARCHAR(255),
        from_name VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Email Settings table created or already exists.');

    // 1. Real Estate Properties
    // Dropping to ensure schema update
    await db.query('DROP TABLE IF EXISTS real_estate_properties');
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_estate_properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        estimated_cost VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        main_image VARCHAR(255) NOT NULL,
        sub_images JSON,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('real_estate_properties table created.');

    // 2. Design & Architecture Properties
    await db.query('DROP TABLE IF EXISTS design_architecture_properties');
    await db.query(`
      CREATE TABLE IF NOT EXISTS design_architecture_properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        estimated_cost VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        main_image VARCHAR(255) NOT NULL,
        sub_images JSON,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('design_architecture_properties table created.');

    // 3. Construction Properties
    await db.query('DROP TABLE IF EXISTS construction_properties');
    await db.query(`
      CREATE TABLE IF NOT EXISTS construction_properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        estimated_cost VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        main_image VARCHAR(255) NOT NULL,
        sub_images JSON,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('construction_properties table created.');

    // 4. Interiors Properties
    await db.query('DROP TABLE IF EXISTS interiors_properties');
    await db.query(`
      CREATE TABLE IF NOT EXISTS interiors_properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        estimated_cost VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        main_image VARCHAR(255) NOT NULL,
        sub_images JSON,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('interiors_properties table created.');


    // Add initial admin user if not exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      // Ensure email is set for the default admin
      await db.query('INSERT INTO users (username, password, role, email, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'ADMIN', 'admin@example.com', 'Super', 'Admin', true]);
      console.log('Default admin user created: admin / password123');
    } else {
        console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('\n*** DATABASE CONNECTION ERROR ***');
        console.error('Access was denied for user "' + process.env.DB_USER + '"@"' + process.env.DB_HOST + '".');
        console.error('Please check your backend/.env file and ensure DB_PASSWORD is set correctly.');
        console.error('If you have not set a password for MySQL, try setting DB_PASSWORD to an empty string in .env');
        console.error('*********************************\n');
    }
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupDatabase();
