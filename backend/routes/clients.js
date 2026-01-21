const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all clients (with search)
router.get('/', authenticateToken, async (req, res) => {
    // Only Admin
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied.' });

    const { search } = req.query;
    let query = 'SELECT * FROM clients';
    const params = [];

    if (search) {
        query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR contact_number LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const [clients] = await db.query(query, params);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new client (Admin only)
router.post('/', authenticateToken, async (req, res) => {
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM clients WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO clients (
        first_name, last_name, email, postal_code, site_address,
        correspondence_address, contact_number, password_hash,
        status, is_approved, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', FALSE, 'User')`,
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

// PATCH deactivate
router.patch('/:id/deactivate', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });
    try {
        await db.query("UPDATE clients SET status = 'Inactive' WHERE id = ?", [req.params.id]);
        res.json({ message: 'Client deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH approve
router.patch('/:id/approve', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });
    try {
        await db.query("UPDATE clients SET is_approved = TRUE WHERE id = ?", [req.params.id]);
        res.json({ message: 'Client approved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update client
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });
    const { first_name, last_name, email, postal_code, site_address, correspondence_address, contact_number } = req.body;
    try {
        await db.query(
            `UPDATE clients SET first_name=?, last_name=?, email=?, postal_code=?, site_address=?, correspondence_address=?, contact_number=? WHERE id=?`,
            [first_name, last_name, email, postal_code, site_address, correspondence_address, contact_number, req.params.id]
        );
        res.json({ message: 'Client updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
