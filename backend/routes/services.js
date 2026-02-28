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

// GET all services
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT s.*, st.name as service_type_name
            FROM services s
            LEFT JOIN service_types st ON s.service_type_id = st.id
        `;
        const params = [];

        if (search) {
            query += ' WHERE s.name LIKE ? OR st.name LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new service
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, service_type_id, description, status } = req.body;
        const image_url = req.file ? req.file.path : null;

        if (!name || !service_type_id) {
             return res.status(400).json({ message: 'Name and Service Type are required' });
        }

        const [result] = await db.query(
            'INSERT INTO services (name, service_type_id, description, image_url, status) VALUES (?, ?, ?, ?, ?)',
            [name, service_type_id, description, image_url, status || 'draft']
        );

        res.status(201).json({ message: 'Service created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update service
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, service_type_id, description, status } = req.body;
        const id = req.params.id;

        // Check if exists
        const [existing] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ message: 'Service not found' });

        let image_url = existing[0].image_url;
        if (req.file) {
            image_url = req.file.path;
        }

        await db.query(
            'UPDATE services SET name = ?, service_type_id = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
            [name, service_type_id, description, image_url, status, id]
        );

        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE service
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
