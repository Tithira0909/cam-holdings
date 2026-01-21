const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/inquiries - Public submission
router.post('/', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    try {
        await db.query(
            'INSERT INTO inquiries (client_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, subject || 'General Inquiry', message]
        );
        res.status(201).json({ message: 'Inquiry submitted successfully.' });
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
