const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', requireAuth, requireRole('ADMIN'), getStats);

module.exports = router;
