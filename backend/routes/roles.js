const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all roles
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM roles ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create role
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, permissions, status } = req.body; // permissions usually JSON string or array
    try {
        const [result] = await db.query(
            'INSERT INTO roles (name, permissions, status) VALUES (?, ?, ?)',
            [name, JSON.stringify(permissions), status || 'Active']
        );
        res.status(201).json({ id: result.insertId, message: 'Role created successfully' });
    } catch (error) {
        console.error('Error creating role:', error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: 'Role name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update role
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { name, permissions, status } = req.body;
    try {
        await db.query(
            'UPDATE roles SET name = ?, permissions = ?, status = ? WHERE id = ?',
            [name, JSON.stringify(permissions), status, req.params.id]
        );
        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete role
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
