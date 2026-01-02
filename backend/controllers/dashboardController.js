const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "CLIENT"');
    const [posts] = await db.query('SELECT COUNT(*) as count FROM blogs');
    const [pendingPosts] = await db.query('SELECT COUNT(*) as count FROM blogs WHERE is_approved = FALSE');
    const [inquiries] = await db.query('SELECT COUNT(*) as count FROM inquiries');
    const [pendingQuotations] = await db.query('SELECT COUNT(*) as count FROM quotations WHERE status = "Pending"');

    res.json({
      registered_users: users[0].count,
      total_posts: posts[0].count,
      not_approved_posts: pendingPosts[0].count,
      inquiries_count: inquiries[0].count,
      pending_quotations_count: pendingQuotations[0].count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
