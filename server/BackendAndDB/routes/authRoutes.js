const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login — Authenticate user
router.post('/login', authController.loginUser);

module.exports = router;
