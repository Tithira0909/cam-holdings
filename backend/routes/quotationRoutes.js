const express = require('express');
const router = express.Router();
const { getAllQuotations, createQuotation, updateQuotationStatus, deleteQuotation } = require('../controllers/quotationsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('ADMIN'), getAllQuotations);
router.post('/', requireAuth, createQuotation);
router.patch('/:id/status', requireAuth, requireRole('ADMIN'), updateQuotationStatus);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteQuotation);

module.exports = router;
