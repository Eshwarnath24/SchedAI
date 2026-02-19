const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register — Register a new user (THIS WAS MISSING)
router.post('/register', authController.registerUser);

// POST /api/auth/login — Authenticate user
router.post('/login', authController.loginUser);

module.exports = router;