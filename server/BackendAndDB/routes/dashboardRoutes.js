/**
 * dashboardRoutes.js
 * 
 * API routes for faculty dashboard data aggregation
 * 
 * Routes:
 *  GET /api/dashboard/:facultyId - Get comprehensive dashboard data for a faculty member
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// ─── Get Faculty Dashboard Data ───────────────────────────────────────────────
// @route   GET /api/dashboard/:facultyId
// @desc    Get aggregated dashboard data (KPIs, workload, schedule, leaves, efficiency)
// @access  Protected
router.get('/:facultyId', protect, dashboardController.getFacultyDashboard);

module.exports = router;
