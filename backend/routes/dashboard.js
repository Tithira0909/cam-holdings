const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/admin/dashboard/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Registered Users: Count of clients
    const [clientResult] = await db.query('SELECT COUNT(*) as count FROM clients');
    const registeredUsers = clientResult[0].count;

    // Total Posts: Count of reviews
    const [reviewResult] = await db.query('SELECT COUNT(*) as count FROM reviews');
    const totalPosts = reviewResult[0].count;

    // Not Approved Posts: Count of reviews where is_published is false
    const [unapprovedResult] = await db.query('SELECT COUNT(*) as count FROM reviews WHERE is_published = 0 OR is_published IS NULL');
    const notApprovedPosts = unapprovedResult[0].count;

    res.json({
      registeredUsers,
      totalPosts,
      notApprovedPosts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
