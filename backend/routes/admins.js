const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all admins (role='ADMIN')
router.get('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied.' });

    const { search } = req.query;
    let query = "SELECT id, first_name, last_name, email, phone, is_active, role, permissions FROM users WHERE role = 'ADMIN'";
    const params = [];

    if (search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const [admins] = await db.query(query, params);
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update admin
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied.' });

    const { first_name, last_name, email, phone } = req.body;
    try {
        await db.query(
            "UPDATE users SET first_name=?, last_name=?, email=?, phone=? WHERE id=? AND role='ADMIN'",
            [first_name, last_name, email, phone, req.params.id]
        );
        res.json({ message: 'Admin updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH deactivate
router.patch('/:id/deactivate', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied.' });

    // Prevent self-deactivation? Optional but good practice.
    if (req.user.id == req.params.id) return res.status(400).json({ message: 'Cannot deactivate yourself.' });

    try {
        await db.query("UPDATE users SET is_active = FALSE WHERE id = ?", [req.params.id]);
        res.json({ message: 'Admin deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH change permissions (For now just role or dummy text)
router.patch('/:id/permissions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied.' });

    const { permissions, role } = req.body;
    // If updating role, ensure it's valid. But here we assume admins managing admins.

    try {
        // We update permissions column or role if provided
        // Prompt says "update permission fields/role"
        // I'll update both if provided

        const updates = [];
        const params = [];
        if (permissions !== undefined) {
            updates.push('permissions = ?');
            params.push(permissions);
        }
        if (role !== undefined) {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) return res.json({ message: 'No changes' });

        params.push(req.params.id);

        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
        res.json({ message: 'Permissions updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
