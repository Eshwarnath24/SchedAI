const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- Faculty Routes ---
// POST /api/leaves/apply-full — Faculty applies for full day leave
router.post('/apply-full', protect, leaveController.applyFullDayLeave);

// POST /api/leaves/apply-slot — Faculty marks slot unavailability
router.post('/apply-slot', protect, leaveController.applySlotLeave);

// GET /api/leaves/history/:facultyId — Faculty's leave history
router.get('/history/:facultyId', protect, leaveController.getHistory);

// --- Admin Routes ---
// GET /api/leaves/all — Admin: view all leave requests
router.get('/all', protect, adminOnly, leaveController.getAllLeaves);

// PATCH /api/leaves/:id/approve — Admin: approve a leave request
router.patch('/:id/approve', protect, adminOnly, leaveController.approveLeave);

// PATCH /api/leaves/:id/reject — Admin: reject a leave request
router.patch('/:id/reject', protect, adminOnly, leaveController.rejectLeave);

module.exports = router;