const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth'); // Standard import

// POST /api/inquiries (Public) - Create new inquiry
router.post('/inquiries', async (req, res) => {
    try {
        const { client_name, email, phone, subject, message } = req.body;
        if (!client_name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }

        const sql = `INSERT INTO inquiries (client_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`;
        await db.query(sql, [client_name, email, phone, subject, message]);

        res.status(201).json({ message: 'Inquiry received successfully' });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/inquiries (Admin) - List all inquiries
router.get('/admin/inquiries', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/inquiries/:id (Admin) - Get single inquiry
router.get('/admin/inquiries/:id', authenticateToken, async (req, res) => {
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

// DELETE /api/admin/inquiries/:id (Admin) - Delete inquiry
router.delete('/admin/inquiries/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
        res.json({ message: 'Inquiry deleted' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
