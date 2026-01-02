const express = require('express');
const router = express.Router();
const { getAllReviews, createReview, updateReviewStatus, deleteReview } = require('../controllers/reviewsController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllReviews);
router.post('/', createReview);
router.patch('/:id/status', requireAuth, requireRole('ADMIN'), updateReviewStatus);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteReview);

module.exports = router;
