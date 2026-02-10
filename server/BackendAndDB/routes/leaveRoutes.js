const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Route for Left Form
router.post('/apply-full', leaveController.applyFullDayLeave);

// Route for Right Form
router.post('/apply-slot', leaveController.applySlotLeave);

// Route for History Panels
router.get('/history/:facultyId', leaveController.getHistory);

module.exports = router;