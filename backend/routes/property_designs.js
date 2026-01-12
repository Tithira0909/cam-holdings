const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM property_designs ORDER BY created_at DESC');
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
            'INSERT INTO property_designs (name, description, status) VALUES (?, ?, ?)',
            [name, description, status || 'Active']
        );
        res.status(201).json({ id: result.insertId, message: 'Property Design created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, status } = req.body;
    try {
        await db.query(
            'UPDATE property_designs SET name=?, description=?, status=? WHERE id=?',
            [name, description, status, req.params.id]
        );
        res.json({ message: 'Property Design updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM property_designs WHERE id=?', [req.params.id]);
        res.json({ message: 'Property Design deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
