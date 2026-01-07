const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT ppi.*, pp.name as part_name
            FROM property_part_items ppi
            LEFT JOIN property_parts pp ON ppi.part_id = pp.id
            ORDER BY ppi.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST
router.post('/', authenticateToken, async (req, res) => {
    const { name, description, status, part_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO property_part_items (name, description, status, part_id) VALUES (?, ?, ?, ?)',
            [name, description, status || 'Active', part_id]
        );
        res.status(201).json({ id: result.insertId, message: 'Property Part Item created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, status, part_id } = req.body;
    try {
        await db.query(
            'UPDATE property_part_items SET name=?, description=?, status=?, part_id=? WHERE id=?',
            [name, description, status, part_id, req.params.id]
        );
        res.json({ message: 'Property Part Item updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM property_part_items WHERE id=?', [req.params.id]);
        res.json({ message: 'Property Part Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
