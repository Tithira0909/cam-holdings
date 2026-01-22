const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { active, category, q, sort } = req.query;
    let query = "SELECT * FROM projects";
    const conditions = [];
    const params = [];

    // Filter by Active status by default unless specified
    if (active !== 'false') {
        conditions.push("status = 'Active'");
    }

    if (q) {
        conditions.push("(title LIKE ? OR description LIKE ? OR location LIKE ?)");
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    // Sort
    if (sort === 'newest') query += " ORDER BY created_at DESC";
    else if (sort === 'oldest') query += " ORDER BY created_at ASC";
    else if (sort === 'az') query += " ORDER BY title ASC";
    else query += " ORDER BY is_featured DESC, created_at DESC"; // Default featured then new

    const [projects] = await db.query(query, params);
    res.json({ items: projects }); // Standardize response structure
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one project by ID or Slug
router.get('/:id', async (req, res) => {
  try {
    const isId = /^\d+$/.test(req.params.id);
    const whereClause = isId ? 'p.id = ?' : 'p.slug = ?';

    // Fix client name join (concat first + last)
    // Note: SQLite uses || for concat, MySQL uses CONCAT().
    // We try generic approach or standard SQL. || is standard SQL.
    // But MySQL requires setting PIPES_AS_CONCAT mode or using CONCAT function.
    // Let's use logic in code or simple query.
    // Safe bet: Select columns and combine in JS? No, SQL is better.
    // Let's assume MySQL `CONCAT(c.first_name, ' ', c.last_name)`
    // Or for SQLite `c.first_name || ' ' || c.last_name`
    // We will try `CONCAT` if environment is MySQL, but local is SQLite (wrapper).
    // The `db.js` wrapper is SQLite. `mysql2` is MySQL.
    // If production is MySQL, CONCAT is safer.
    // Actually, let's just fetch fields and format in frontend?
    // Frontend expects `client_name`.
    // Let's use a conditional for compatibility or just `c.first_name, c.last_name` and let frontend join.

    const query = `
      SELECT p.*, s.name as service_name, st.name as category_name,
             c.first_name as client_first, c.last_name as client_last
      FROM projects p
      LEFT JOIN services s ON p.service_id = s.id
      LEFT JOIN service_types st ON s.service_type_id = st.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE ${whereClause}
    `;

    const [projects] = await db.query(query, [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });

    const proj = projects[0];
    // Construct client_name
    if (proj.client_first) {
        proj.client_name = `${proj.client_first} ${proj.client_last || ''}`.trim();
    }

    res.json(proj);
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
