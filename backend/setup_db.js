const db = require('./db');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  try {
    console.log('Setting up SQLite database...');

    // Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'CLIENT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        is_active BOOLEAN DEFAULT 1,
        permissions TEXT
      )
    `);

    // Projects Table
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        client_id INTEGER,
        slug TEXT,
        description_html TEXT,
        service_id INTEGER,
        project_status TEXT,
        start_date DATE,
        end_date DATE,
        is_featured BOOLEAN DEFAULT 0,
        drawing_url TEXT,
        project_file_url TEXT
      )
    `);

    // Clients Table
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'Active',
        is_approved BOOLEAN DEFAULT 0,
        role TEXT DEFAULT 'User'
      )
    `);

    // Service Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        banner TEXT,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        service_type_id INTEGER,
        description TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL
      )
    `);

    // Reviews Table
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inquiries Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotations Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT NOT NULL,
        contact TEXT,
        type TEXT DEFAULT 'Quotation',
        date DATE,
        time TIME,
        details_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Document Types Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'Project Document',
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Project Tasks Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blogs Table
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotation Settings Tables (Simplified)
    await db.query(`CREATE TABLE IF NOT EXISTS property_designs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, status TEXT, created_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS property_parts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, status TEXT, created_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS property_part_items (id INTEGER PRIMARY KEY AUTOINCREMENT, part_id INTEGER, name TEXT, description TEXT, status TEXT, created_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS property_services (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, status TEXT, created_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS property_service_items (id INTEGER PRIMARY KEY AUTOINCREMENT, service_id INTEGER, name TEXT, description TEXT, status TEXT, created_at DATETIME)`);

    // Roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        permissions TEXT,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Real Estate Properties Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_estate_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        price_budget TEXT NOT NULL,
        status BOOLEAN DEFAULT 1,
        featured BOOLEAN DEFAULT 0,
        short_description TEXT NOT NULL,
        description TEXT,
        cover_image TEXT NOT NULL,
        gallery_images TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqft TEXT,
        property_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings Tables
    await db.query(`CREATE TABLE IF NOT EXISTS analytics_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, google_analytics_id TEXT, facebook_pixel_id TEXT, custom_header_scripts TEXT, custom_footer_scripts TEXT, updated_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS site_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, site_title TEXT, site_tagline TEXT, site_email TEXT, contact_phone TEXT, address TEXT, logo_url TEXT, favicon_url TEXT, maintenance_mode BOOLEAN, social_facebook TEXT, social_twitter TEXT, social_instagram TEXT, social_linkedin TEXT, social_youtube TEXT, updated_at DATETIME)`);
    await db.query(`CREATE TABLE IF NOT EXISTS email_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, mail_driver TEXT, mail_host TEXT, mail_port TEXT, mail_username TEXT, mail_password TEXT, mail_encryption TEXT, from_address TEXT, from_name TEXT, updated_at DATETIME)`);

    // Add initial admin user
    const [existingAdmin] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query('INSERT INTO users (username, password, role, email, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'ADMIN', 'admin@example.com', 'Super', 'Admin', 1]);
      console.log('Default admin user created: admin / password123');
    } else {
        console.log('Admin user already exists.');
    }

    console.log('Database setup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
