const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/courses — all courses grouped by year/semester
router.get('/', courseController.getAllCourses);

// POST /api/courses — create a course (admin only)
router.post('/', protect, courseController.createCourse);

// PUT /api/courses/:id — update a course
router.put('/:id', protect, courseController.updateCourse);

// DELETE /api/courses/:id — delete a course
router.delete('/:id', protect, courseController.deleteCourse);

module.exports = router;
