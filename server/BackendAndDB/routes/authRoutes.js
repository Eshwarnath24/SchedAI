const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login — Faculty/Admin login
router.post('/login', authController.loginUser);

// POST /api/auth/student-login — Student login
router.post('/student-login', authController.loginStudent);

// GET /api/auth/me — Verify token & return user/student info (protected)
router.get('/me', protect, authController.getMe);

module.exports = router;
