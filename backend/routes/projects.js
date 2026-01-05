const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify token (simplified for now)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// GET all projects
router.get('/', async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one project
router.get('/:id', async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(projects[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new project (Protected)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)',
      [title, description, image_url]
    );
    res.status(201).json({ id: result.insertId, title, description, image_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update project (Protected)
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, image_url } = req.body;
  try {
    await db.query(
      'UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?',
      [title, description, image_url, req.params.id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE project (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
