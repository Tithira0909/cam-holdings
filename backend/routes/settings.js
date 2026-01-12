const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings');
const authenticateToken = require('../middleware/auth');

// Dashboard Stats
// Note: Frontend likely expects GET /api/admin/dashboard/stats
router.get('/dashboard/stats', authenticateToken, controller.getDashboardStats);

// Analytics
router.get('/settings/analytics', authenticateToken, controller.getAnalyticsSettings);
router.put('/settings/analytics', authenticateToken, controller.updateAnalyticsSettings);

// Site
router.get('/settings/site', authenticateToken, controller.getSiteSettings);
router.put('/settings/site', authenticateToken, controller.updateSiteSettings);

// Email
router.get('/settings/email', authenticateToken, controller.getEmailSettings);
router.put('/settings/email', authenticateToken, controller.updateEmailSettings);

module.exports = router;
