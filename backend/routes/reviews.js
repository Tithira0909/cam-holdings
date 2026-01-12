const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET all reviews
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new review
router.post('/', authenticateToken, async (req, res) => {
    try {
        let { client_name, name, description, rating, source } = req.body;

        // Accept 'name' as alias for client_name
        if (!client_name && name) {
            client_name = name;
        }

        if (!client_name || !rating) {
            return res.status(400).json({ message: 'Name and Rating are required' });
        }

        const [result] = await db.query(
            'INSERT INTO reviews (client_name, description, rating, source, is_approved, status) VALUES (?, ?, ?, ?, 0, "Active")',
            [client_name, description, rating, source || 'Unknown']
        );
        res.status(201).json({ message: 'Review added', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update review
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { client_name, description, rating, source } = req.body;
        const id = req.params.id;

        await db.query(
            'UPDATE reviews SET client_name = ?, description = ?, rating = ?, source = ? WHERE id = ?',
            [client_name, description, rating, source, id]
        );
        res.json({ message: 'Review updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE review
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH approve
router.patch('/:id/approve', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Review approved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH status (toggle)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT status FROM reviews WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
        await db.query('UPDATE reviews SET status = ? WHERE id = ?', [newStatus, req.params.id]);

        res.json({ message: `Review status changed to ${newStatus}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
