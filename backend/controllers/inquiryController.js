const { query } = require('../db');

const submitInquiry = async (req, res) => {
    const { name, email, phone, message } = req.body;
    try {
        await query("INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)",
            [name, email, phone, message]);
        res.status(201).json({ message: 'Inquiry submitted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listInquiries = async (req, res) => {
    try {
        const rows = await query("SELECT * FROM inquiries ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateInquiryStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query("UPDATE inquiries SET status=? WHERE id=?", [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { submitInquiry, listInquiries, updateInquiryStatus };
