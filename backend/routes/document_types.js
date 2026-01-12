const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET all document types (Searchable)
router.get('/', authenticateToken, async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM document_types';
        const params = [];

        if (search) {
            query += ' WHERE document_name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [types] = await db.query(query, params);
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new document type
router.post('/', authenticateToken, async (req, res) => {
    const { document_name, description, type, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO document_types (document_name, description, type, status) VALUES (?, ?, ?, ?)',
            [document_name, description, type || 'Project Document', status || 'Active']
        );
        res.status(201).json({ id: result.insertId, message: 'Document Type created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update document type
router.put('/:id', authenticateToken, async (req, res) => {
    const { document_name, description, type, status } = req.body;
    const id = req.params.id;

    try {
        await db.query(
            'UPDATE document_types SET document_name = ?, description = ?, type = ?, status = ? WHERE id = ?',
            [document_name, description, type, status, id]
        );
        res.json({ message: 'Document Type updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE document type
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM document_types WHERE id = ?', [req.params.id]);
        res.json({ message: 'Document Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
