const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleApiController');

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

module.exports = router;
