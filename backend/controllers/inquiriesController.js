const db = require('../config/db');

exports.getAllInquiries = async (req, res) => {
  try {
    const [inquiries] = await db.query('SELECT * FROM inquiries');
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInquiry = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
