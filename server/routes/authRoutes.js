const express = require('express');
const router = express.Router();
const { loginAdmin, loginClient, logout, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/admin/login', loginAdmin);
router.post('/client/login', loginClient);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
