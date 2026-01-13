const express = require('express');
const router = express.Router();
const { getAllInquiries, createInquiry, deleteInquiry } = require('../controllers/inquiriesController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('ADMIN'), getAllInquiries);
router.post('/', createInquiry);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteInquiry);

module.exports = router;
