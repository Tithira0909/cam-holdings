const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// POST create new client (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  // Validate role
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  const {
    first_name,
    last_name,
    email,
    postal_code,
    site_address,
    correspondence_address,
    contact_number,
    password,
    confirm_password
  } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !password || !confirm_password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  // Email format validation (simple regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM clients WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert client
    const [result] = await db.query(
      `INSERT INTO clients (
        first_name, last_name, email, postal_code, site_address,
        correspondence_address, contact_number, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, email, postal_code, site_address,
        correspondence_address, contact_number, hashedPassword
      ]
    );

    res.status(201).json({
      message: 'Client created successfully',
      clientId: result.insertId
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
