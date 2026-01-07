const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET /api/admin/quotations - Admin List
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM quotations ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/quotations/:id - Admin Detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM quotations WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
