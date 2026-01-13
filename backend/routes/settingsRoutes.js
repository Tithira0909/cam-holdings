const express = require('express');
const router = express.Router();
const { getQuotationSettings, updateQuotationSettings, getSiteSettings, updateSiteSettings } = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/quotation', requireAuth, requireRole('ADMIN'), getQuotationSettings);
router.post('/quotation', requireAuth, requireRole('ADMIN'), updateQuotationSettings);
router.get('/site', getSiteSettings);
router.post('/site', requireAuth, requireRole('ADMIN'), updateSiteSettings);

module.exports = router;
