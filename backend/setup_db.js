const db = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('Using SQLite database.');

    // Create Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'CLIENT',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        is_active BOOLEAN DEFAULT 1,
        permissions TEXT
      )
    `);

    // Migration for Users Table (Add columns if missing)
    // SQLite ALTER TABLE can only add one column at a time
    const userCols = [
        "ALTER TABLE users ADD COLUMN first_name TEXT",
        "ALTER TABLE users ADD COLUMN last_name TEXT",
        "ALTER TABLE users ADD COLUMN email TEXT",
        "ALTER TABLE users ADD COLUMN phone TEXT",
        "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1",
        "ALTER TABLE users ADD COLUMN permissions TEXT"
    ];
    for (const q of userCols) { try { await db.query(q); } catch(e) {} }
    console.log('Users table ready.');

    // Create Projects Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        location TEXT,
        budget TEXT,
        status TEXT DEFAULT 'Active',
        progress_status TEXT DEFAULT 'Not Started',
        description TEXT,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        client_id INTEGER,
        slug TEXT,
        description_html TEXT,
        service_id INTEGER,
        project_status TEXT,
        start_date TEXT,
        end_date TEXT,
        is_featured BOOLEAN DEFAULT 0,
        drawing_url TEXT,
        project_file_url TEXT,
        category TEXT,
        gallery_images TEXT
      )
    `);

    // Migration for Projects Table
    const projCols = [
        "ALTER TABLE projects ADD COLUMN location TEXT",
        "ALTER TABLE projects ADD COLUMN budget TEXT",
        "ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Active'",
        "ALTER TABLE projects ADD COLUMN progress_status TEXT DEFAULT 'Not Started'",
        "ALTER TABLE projects ADD COLUMN client_id INTEGER",
        "ALTER TABLE projects ADD COLUMN slug TEXT",
        "ALTER TABLE projects ADD COLUMN description_html TEXT",
        "ALTER TABLE projects ADD COLUMN service_id INTEGER",
        "ALTER TABLE projects ADD COLUMN project_status TEXT",
        "ALTER TABLE projects ADD COLUMN start_date TEXT",
        "ALTER TABLE projects ADD COLUMN end_date TEXT",
        "ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT 0",
        "ALTER TABLE projects ADD COLUMN drawing_url TEXT",
        "ALTER TABLE projects ADD COLUMN project_file_url TEXT",
        "ALTER TABLE projects ADD COLUMN category TEXT",
        "ALTER TABLE projects ADD COLUMN gallery_images TEXT"
    ];
    for (const q of projCols) { try { await db.query(q); } catch(e) {} }
    console.log('Projects table ready.');

    // Create Clients Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        postal_code TEXT,
        site_address TEXT,
        correspondence_address TEXT,
        contact_number TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Active',
        is_approved BOOLEAN DEFAULT 0,
        role TEXT DEFAULT 'User'
      )
    `);

    const clientCols = [
        "ALTER TABLE clients ADD COLUMN status TEXT DEFAULT 'Active'",
        "ALTER TABLE clients ADD COLUMN is_approved BOOLEAN DEFAULT 0",
        "ALTER TABLE clients ADD COLUMN role TEXT DEFAULT 'User'",
        "ALTER TABLE clients ADD COLUMN postal_code TEXT",
        "ALTER TABLE clients ADD COLUMN site_address TEXT",
        "ALTER TABLE clients ADD COLUMN correspondence_address TEXT",
        "ALTER TABLE clients ADD COLUMN contact_number TEXT"
    ];
    for (const q of clientCols) { try { await db.query(q); } catch(e) {} }
    console.log('Clients table ready.');

    // Create Service Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        banner TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Service Types table ready.');

    // Create Services Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        service_type_id INTEGER,
        description TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL
      )
    `);
    console.log('Services table ready.');

    // Create Reviews Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        message TEXT,
        rating INTEGER DEFAULT 5,
        source TEXT DEFAULT 'Google',
        is_active BOOLEAN DEFAULT 0,
        is_published BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const reviewCols = [
        "ALTER TABLE reviews ADD COLUMN email TEXT",
        "ALTER TABLE reviews ADD COLUMN is_active BOOLEAN DEFAULT 0",
        "ALTER TABLE reviews ADD COLUMN is_published BOOLEAN DEFAULT 0",
        "ALTER TABLE reviews ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP"
    ];
    for (const q of reviewCols) { try { await db.query(q); } catch(e) {} }
    console.log('Reviews table ready.');

    // Create Inquiries Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Inquiries table ready.');

    // Create Quotations Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT NOT NULL,
        contact TEXT,
        type TEXT DEFAULT 'Quotation',
        date TEXT,
        time TEXT,
        details_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Quotations table ready.');

    // Create Document Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'Project Document',
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Document Types table ready.');

    // Create Project Tasks Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Project Tasks table ready.');

    // Create Blogs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'News Content',
        title TEXT NOT NULL,
        banner_url TEXT,
        featured_image_url TEXT,
        gallery_json TEXT,
        content_html TEXT,
        published_status TEXT DEFAULT 'Unpublished',
        is_featured BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Blogs table ready.');

    // Quotation Settings Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_designs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_part_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (part_id) REFERENCES property_parts(id) ON DELETE SET NULL
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_service_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES property_services(id) ON DELETE SET NULL
      )
    `);
    console.log('Quotation Settings tables ready.');

    // New Settings Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        permissions TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Roles table ready.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_analytics_id TEXT,
        facebook_pixel_id TEXT,
        custom_header_scripts TEXT,
        custom_footer_scripts TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Analytics Settings table ready.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_title TEXT,
        site_tagline TEXT,
        site_email TEXT,
        contact_phone TEXT,
        address TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        maintenance_mode BOOLEAN DEFAULT 0,
        social_facebook TEXT,
        social_twitter TEXT,
        social_instagram TEXT,
        social_linkedin TEXT,
        social_youtube TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Site Settings table ready.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mail_driver TEXT DEFAULT 'smtp',
        mail_host TEXT,
        mail_port TEXT,
        mail_username TEXT,
        mail_password TEXT,
        mail_encryption TEXT DEFAULT 'tls',
        from_address TEXT,
        from_name TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Email Settings table ready.');

    // Service Listings
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_estate_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        estimated_cost TEXT NOT NULL,
        description TEXT NOT NULL,
        main_image TEXT NOT NULL,
        sub_images TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS design_architecture_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        estimated_cost TEXT NOT NULL,
        description TEXT NOT NULL,
        main_image TEXT NOT NULL,
        sub_images TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS construction_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        estimated_cost TEXT NOT NULL,
        description TEXT NOT NULL,
        main_image TEXT NOT NULL,
        sub_images TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS interiors_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        estimated_cost TEXT NOT NULL,
        description TEXT NOT NULL,
        main_image TEXT NOT NULL,
        sub_images TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Service Listings tables ready.');

    // Add initial admin user
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query('INSERT INTO users (username, password, role, email, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'ADMIN', 'admin@example.com', 'Super', 'Admin', 1]);
      console.log('Default admin user created: admin / password123');
    } else {
        console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
