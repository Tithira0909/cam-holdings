const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify if user is admin (assuming auth middleware populates req.user)
// Since the prompt says "Use existing admin token: Authorization: Bearer <token>",
// we rely on the main index.js to handle JWT verification before this,
// OR we implement a simple check here if `req.user` is available.
// However, looking at index.js, it doesn't seem to apply middleware globally.
// I'll add a middleware for token verification here or assume it's passed.
// For now, I'll add the auth check.

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    if (user.role !== 'ADMIN') return res.sendStatus(403);
    next();
  });
};

// GET /api/admin/inquiries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/inquiries/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM inquiries WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/admin/inquiries/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM inquiries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
