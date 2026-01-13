const db = require('../config/db');

exports.getAllQuotations = async (req, res) => {
  try {
    const [quotations] = await db.query('SELECT * FROM quotations');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  const { details } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO quotations (user_id, details, status) VALUES (?, ?, "Pending")',
      [req.user.id, details]
    );
    res.status(201).json({ id: result.insertId, details });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Quotation status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    await db.query('DELETE FROM quotations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
