const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM property_services ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST
router.post('/', authenticateToken, async (req, res) => {
    const { name, description, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO property_services (name, description, status) VALUES (?, ?, ?)',
            [name, description, status || 'Active']
        );
        res.status(201).json({ id: result.insertId, message: 'Property Service created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, status } = req.body;
    try {
        await db.query(
            'UPDATE property_services SET name=?, description=?, status=? WHERE id=?',
            [name, description, status, req.params.id]
        );
        res.json({ message: 'Property Service updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM property_services WHERE id=?', [req.params.id]);
        res.json({ message: 'Property Service deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
