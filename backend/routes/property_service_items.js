const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT psi.*, ps.name as service_name
            FROM property_service_items psi
            LEFT JOIN property_services ps ON psi.service_id = ps.id
            ORDER BY psi.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST
router.post('/', authenticateToken, async (req, res) => {
    const { name, description, status, service_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO property_service_items (name, description, status, service_id) VALUES (?, ?, ?, ?)',
            [name, description, status || 'Active', service_id]
        );
        res.status(201).json({ id: result.insertId, message: 'Property Service Item created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, status, service_id } = req.body;
    try {
        await db.query(
            'UPDATE property_service_items SET name=?, description=?, status=?, service_id=? WHERE id=?',
            [name, description, status, service_id, req.params.id]
        );
        res.json({ message: 'Property Service Item updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM property_service_items WHERE id=?', [req.params.id]);
        res.json({ message: 'Property Service Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
