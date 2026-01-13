const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all reviews with filters
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { source, rating, active, published } = req.query;
        let query = 'SELECT * FROM reviews';
        const conditions = [];
        const params = [];

        if (source) {
            conditions.push('source = ?');
            params.push(source);
        }
        if (rating) {
            conditions.push('rating = ?');
            params.push(rating);
        }
        if (active !== undefined) {
            conditions.push('is_active = ?');
            params.push(active === '1' || active === 'true' ? 1 : 0);
        }
        if (published !== undefined) {
            conditions.push('is_published = ?');
            params.push(published === '1' || published === 'true' ? 1 : 0);
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

// POST new review (Admin manual add)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, email, message, rating, source, is_active, is_published } = req.body;

        if (!name || !rating) {
            return res.status(400).json({ message: 'Name and Rating are required' });
        }

        const [result] = await db.query(
            'INSERT INTO reviews (name, email, message, rating, source, is_active, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, message, rating, source || 'Unknown', is_active ? 1 : 0, is_published ? 1 : 0]
        );
        res.status(201).json({ message: 'Review added', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH update review (toggle status, publish, or edit details)
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const fields = [];
        const values = [];

        // Allow updates to specific fields
        const allowedFields = ['name', 'email', 'message', 'rating', 'source', 'is_active', 'is_published'];

        for (const key of Object.keys(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        values.push(id);
        const query = `UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`;

        await db.query(query, values);
        res.json({ message: 'Review updated successfully' });
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

module.exports = router;
