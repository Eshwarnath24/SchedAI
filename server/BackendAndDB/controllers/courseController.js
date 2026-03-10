/**
 * courseController.js
 * CRUD operations for academic courses (used by Allocation page).
 */

const Course = require('../DB_models/Course');

// Helper: derive year from semester
const yearFromSem = (sem) => Math.ceil(sem / 2);

// ── GET /api/courses  ─────────────────────────────────────────────────────────
// Returns all courses grouped by year → semester
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).sort({ semester: 1, code: 1 });

        // Build nested structure: { year1: { 1: [...], 2: [...] }, ... }
        const grouped = {};
        for (let y = 1; y <= 4; y++) {
            const key = `year${y}`;
            grouped[key] = {};
            const sems = [y * 2 - 1, y * 2]; // odd + even sems for the year
            sems.forEach(s => { grouped[key][s] = []; });
        }

        courses.forEach(c => {
            const year = yearFromSem(c.semester);
            const yearKey = `year${year}`;
            if (!grouped[yearKey]) grouped[yearKey] = {};
            if (!grouped[yearKey][c.semester]) grouped[yearKey][c.semester] = [];

            grouped[yearKey][c.semester].push({
                _id: c._id,
                code: c.code,
                title: c.name,
                ltp: c.ltp || deriveLTP(c),
                credits: c.credits === 0 ? 'P/F' : String(c.credits),
                category: c.category || 'Core',
                type: c.type,
                semester: c.semester,
                department: c.department,
            });
        });

        res.json({ success: true, courses: grouped });
    } catch (err) {
        console.error('[courseController] getAllCourses error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch courses' });
    }
};

// ── POST /api/courses  ────────────────────────────────────────────────────────
exports.createCourse = async (req, res) => {
    try {
        const { code, title, ltp, credits, category, type, semester, department } = req.body;

        if (!code || !title || !semester) {
            return res.status(400).json({ success: false, error: 'code, title and semester are required' });
        }

        const existing = await Course.findOne({ code });
        if (existing) {
            return res.status(409).json({ success: false, error: `Course code ${code} already exists` });
        }

        const creditsNum = credits === 'P/F' ? 0 : parseFloat(credits) || 0;

        const course = await Course.create({
            code,
            name: title,
            ltp: ltp || '3-0-0',
            credits: creditsNum,
            category: category || 'Core',
            type: type || 'Theory',
            duration: 1,
            semester: Number(semester),
            department: department || 'CSE',
            minWeeklyHours: 3,
        });

        res.status(201).json({
            success: true,
            course: {
                _id: course._id,
                code: course.code,
                title: course.name,
                ltp: course.ltp,
                credits: course.credits === 0 ? 'P/F' : String(course.credits),
                category: course.category,
                type: course.type,
                semester: course.semester,
            }
        });
    } catch (err) {
        console.error('[courseController] createCourse error:', err);
        res.status(500).json({ success: false, error: err.message || 'Failed to create course' });
    }
};

// ── PUT /api/courses/:id  ─────────────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
    try {
        const { code, title, ltp, credits, category, type, semester, department } = req.body;

        const creditsNum = credits === 'P/F' ? 0 : parseFloat(credits) || 0;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                code,
                name: title,
                ltp,
                credits: creditsNum,
                category,
                type,
                ...(semester && { semester: Number(semester) }),
                ...(department && { department }),
            },
            { new: true }
        );

        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

        res.json({
            success: true,
            course: {
                _id: course._id,
                code: course.code,
                title: course.name,
                ltp: course.ltp,
                credits: course.credits === 0 ? 'P/F' : String(course.credits),
                category: course.category,
                type: course.type,
                semester: course.semester,
            }
        });
    } catch (err) {
        console.error('[courseController] updateCourse error:', err);
        res.status(500).json({ success: false, error: err.message || 'Failed to update course' });
    }
};

// ── DELETE /api/courses/:id  ──────────────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
        res.json({ success: true, message: 'Course deleted' });
    } catch (err) {
        console.error('[courseController] deleteCourse error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete course' });
    }
};

// ── Helper ────────────────────────────────────────────────────────────────────
function deriveLTP(course) {
    const d = course.duration || 1;
    if (course.type === 'Lab') return `0-0-${d * 2}`;
    if (course.type === 'CIR') return `0-0-${d}`;
    return `${d}-0-0`;
}
