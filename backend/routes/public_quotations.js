const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/quotations - Public submission
router.post('/', async (req, res) => {
    const { first_name, last_name, email, phone, type, date, time, details, property_design_id } = req.body;

    if (!first_name || !email) {
        return res.status(400).json({ message: 'First name and email are required.' });
    }

    try {
        // Generate Reference ID (e.g., REF-TIMESTAMP-RANDOM)
        const refId = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.query(
            `INSERT INTO quotations (reference_id, first_name, last_name, email, contact, type, date, time, details_json, property_design_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [refId, first_name, last_name || null, email, phone || null, type || 'Quotation', date || null, time || null, JSON.stringify(details || {}), property_design_id || null]
        );

        res.status(201).json({ message: 'Quotation submitted successfully.', reference_id: refId });
    } catch (error) {
        console.error('Error submitting quotation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
