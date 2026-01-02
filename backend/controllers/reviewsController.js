const db = require('../config/db');

exports.getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.query('SELECT * FROM reviews');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  const { customer_name, rating, comment } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO reviews (customer_name, rating, comment, is_approved) VALUES (?, ?, ?, FALSE)',
      [customer_name, rating, comment]
    );
    res.status(201).json({ id: result.insertId, customer_name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  const { is_approved } = req.body;
  try {
    await db.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved, req.params.id]);
    res.json({ message: 'Review status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
