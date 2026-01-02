const bcrypt = require('bcrypt');
const db = require('../config/db');

const seedAdmin = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE role = "ADMIN" LIMIT 1');
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@camholdings.com', hashedPassword, 'ADMIN']
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
