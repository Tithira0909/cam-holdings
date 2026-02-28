const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to generate slug
const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// --- PUBLIC ROUTES ---

// GET /api/services?active=true&category=...
router.get('/services', async (req, res) => {
    try {
        const { active, category } = req.query;
        let query = 'SELECT * FROM services';
        const params = [];
        const conditions = [];

        if (active === 'true') {
            conditions.push('is_active = 1');
        }

        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/services/:slugOrId
router.get('/services/:slugOrId', async (req, res) => {
    try {
        const param = req.params.slugOrId;
        let query = 'SELECT * FROM services WHERE ';
        const sqlParams = [];

        if (/^\d+$/.test(param)) {
            query += 'id = ?';
            sqlParams.push(param);
        } else {
            query += 'slug = ?';
            sqlParams.push(param);
        }

        const [rows] = await db.query(query, sqlParams);
        if (rows.length === 0) return res.status(404).json({ message: 'Service not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- ADMIN ROUTES ---

// POST /api/admin/services
router.post('/admin/services', authenticateToken, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, category, description, isActive, estimatedCost } = req.body;
        const cover_image = req.file ? req.file.path : null;

        if (!title) return res.status(400).json({ message: 'Title is required' });

        let slug = generateSlug(title);
        // Ensure slug uniqueness (simple check)
        const [exists] = await db.query('SELECT id FROM services WHERE slug = ?', [slug]);
        if (exists.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const is_active = isActive === 'true' || isActive === true ? 1 : 0;

        const [result] = await db.query(
            'INSERT INTO services (title, category, description, cover_image, is_active, slug, estimated_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, category, description, cover_image, is_active, slug, estimatedCost]
        );

        res.status(201).json({ message: 'Service created', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/services/:id
router.put('/admin/services/:id', authenticateToken, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, category, description, isActive, estimatedCost } = req.body;
        const id = req.params.id;

        const [current] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
        if (current.length === 0) return res.status(404).json({ message: 'Not found' });

        let cover_image = current[0].cover_image;
        if (req.file) cover_image = req.file.path;

        let slug = current[0].slug;
        if (title && title !== current[0].title) {
             slug = generateSlug(title);
        }

        const is_active = isActive === undefined ? current[0].is_active : (isActive === 'true' || isActive === true ? 1 : 0);

        await db.query(
            'UPDATE services SET title=?, category=?, description=?, cover_image=?, is_active=?, slug=?, estimated_cost=? WHERE id=?',
            [title, category, description, cover_image, is_active, slug, estimatedCost, id]
        );

        res.json({ message: 'Service updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/services/:id
router.delete('/admin/services/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ message: 'Service deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/services/:id/toggle
router.patch('/admin/services/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const [current] = await db.query('SELECT is_active FROM services WHERE id = ?', [req.params.id]);
        if (current.length === 0) return res.status(404).json({ message: 'Not found' });

        const newState = !current[0].is_active;
        await db.query('UPDATE services SET is_active = ? WHERE id = ?', [newState, req.params.id]);

        res.json({ message: 'Status toggled', is_active: newState });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
