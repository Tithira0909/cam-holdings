const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/admin/inquiries - Fetch all inquiries
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/inquiries/:id - Fetch single inquiry
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/inquiries/:id - Delete inquiry
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
