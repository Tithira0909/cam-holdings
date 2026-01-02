const connection = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedAdmin() {
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword123'; // In a real scenario, get this from env or args

  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [adminUsername]);

    if (rows.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [adminUsername, hashedPassword, 'ADMIN']
    );
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    process.exit();
  }
}

seedAdmin();
