const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/:facultyId
router.get('/:facultyId', reportController.getFacultyReport);

module.exports = router;
