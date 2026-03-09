const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleApiController');
const overrideController = require('../controllers/scheduleOverrideController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/schedule/active — Full active schedule grid
router.get('/active', scheduleController.getActiveSchedule);

// GET /api/schedule/teacher/:teacherId — Teacher's timetable
router.get('/teacher/:teacherId', scheduleController.getTeacherSchedule);

// GET /api/schedule/section/:sectionId — Section's timetable
router.get('/section/:sectionId', scheduleController.getSectionSchedule);

// GET /api/schedule/sections — All sections (for dropdowns)
router.get('/sections', scheduleController.getAllSections);

// GET /api/schedule/teachers — All faculty (for dropdowns)
router.get('/teachers', scheduleController.getAllTeachers);

// GET /api/schedule/timeslots — All time slots
router.get('/timeslots', scheduleController.getTimeSlots);

// GET /api/schedule/availability — Free rooms & faculty at current time
router.get('/availability', scheduleController.getCurrentAvailability);

// --- Schedule Override Routes ---
// POST /api/schedule/override — Faculty creates a cancel/reschedule override
router.post('/override', protect, overrideController.createOverride);

// GET /api/schedule/overrides/section/:sectionId — Active overrides for a section
router.get('/overrides/section/:sectionId', overrideController.getOverridesForSection);

// DELETE /api/schedule/override/:id — Remove override (restore class)
router.delete('/override/:id', protect, overrideController.deleteOverride);

module.exports = router;

