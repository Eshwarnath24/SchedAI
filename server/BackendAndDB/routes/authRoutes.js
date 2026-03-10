const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register — Register a new user
router.post('/register', authController.registerUser);

// POST /api/auth/login — Faculty/Admin login
router.post('/login', authController.loginUser);

// POST /api/auth/student-login — Student login
router.post('/student-login', authController.loginStudent);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// GET /api/auth/me — Verify token & return user/student info (protected)
router.get('/me', protect, authController.getMe);

module.exports = router;
