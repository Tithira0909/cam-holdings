const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

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
    const query = `
      SELECT p.*, s.name as service_name, st.name as category_name, CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM projects p
      LEFT JOIN services s ON p.service_id = s.id
      LEFT JOIN service_types st ON s.service_type_id = st.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `;
    const [projects] = await db.query(query, [req.params.id]);
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
