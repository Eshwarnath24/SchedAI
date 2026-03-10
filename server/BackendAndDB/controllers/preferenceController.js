const Course = require('../DB_models/Course');
const FacultyPreference = require('../DB_models/FacultyPreference');
const User = require('../DB_models/User');

/**
 * GET /api/preferences/courses
 * Returns all courses grouped by semester (for the preference form).
 * Query param: ?cycle=odd|even (defaults to 'odd')
 */
const getCoursesForPreferences = async (req, res) => {
    try {
        const cycle = (req.query.cycle || 'odd').toLowerCase();
        const activeSems = cycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

        const courses = await Course.find({
            semester: { $in: activeSems },
            type: { $ne: 'CIR' } // CIR courses are auto-assigned, not preference-based
        }).select('code name credits type semester duration').sort({ semester: 1, code: 1 });

        // Group by semester
        const grouped = {};
        activeSems.forEach(sem => { grouped[sem] = []; });
        courses.forEach(c => {
            if (grouped[c.semester]) {
                grouped[c.semester].push({
                    _id: c._id,
                    code: c.code,
                    title: c.name,
                    credits: c.credits,
                    type: c.type,
                    ltp: c.duration === 2 ? '0-0-3' : '3-0-0', // approximate L-T-P from duration
                    sem: c.semester
                });
            }
        });

        res.json({ semesterCycle: cycle, courses: grouped });
    } catch (err) {
        console.error('Error fetching courses for preferences:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

/**
 * GET /api/preferences/my
 * Returns the logged-in faculty's saved preferences.
 * Query param: ?cycle=odd|even (defaults to 'odd')
 */
const getMyPreferences = async (req, res) => {
    try {
        const facultyId = req.user.userId;
        const cycle = (req.query.cycle || 'odd').toLowerCase();

        const pref = await FacultyPreference.findOne({
            faculty: facultyId,
            semesterCycle: cycle
        }).populate('preferences.course', 'code name credits type semester');

        if (!pref) {
            return res.json({ found: false, preferences: [] });
        }

        res.json({
            found: true,
            submittedAt: pref.submittedAt,
            preferences: pref.preferences.map(p => ({
                courseId: p.course._id,
                code: p.course.code,
                title: p.course.name,
                credits: p.course.credits,
                type: p.course.type,
                semester: p.semester,
                priority: p.priority
            }))
        });
    } catch (err) {
        console.error('Error fetching my preferences:', err);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

/**
 * POST /api/preferences
 * Save or update the faculty's course preference ranking.
 * Body: { semesterCycle: 'odd'|'even', preferences: [{ courseId, semester, priority }] }
 */
const submitPreferences = async (req, res) => {
    try {
        const facultyId = req.user.userId;
        const { semesterCycle, preferences } = req.body;

        if (!semesterCycle || !['odd', 'even'].includes(semesterCycle)) {
            return res.status(400).json({ error: 'Invalid semesterCycle. Must be "odd" or "even".' });
        }

        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ error: 'Preferences array is required and must not be empty.' });
        }

        // Validate all course IDs exist
        const courseIds = preferences.map(p => p.courseId);
        const existingCourses = await Course.find({ _id: { $in: courseIds } }).select('_id');
        const existingIds = new Set(existingCourses.map(c => c._id.toString()));

        const invalidIds = courseIds.filter(id => !existingIds.has(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid course IDs: ${invalidIds.join(', ')}` });
        }

        // Build preference entries
        const prefEntries = preferences.map(p => ({
            course: p.courseId,
            semester: p.semester,
            priority: p.priority
        }));

        // Upsert: one document per faculty per cycle
        await FacultyPreference.findOneAndUpdate(
            { faculty: facultyId, semesterCycle },
            {
                faculty: facultyId,
                semesterCycle,
                preferences: prefEntries,
                submittedAt: new Date()
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, message: 'Preferences saved successfully.' });
    } catch (err) {
        console.error('Error saving preferences:', err);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
};

/**
 * GET /api/schedule/preferences/status
 * Returns faculty preference submission status for admin dashboard.
 * Query param: ?cycle=odd|even (defaults to 'odd')
 */
const getPreferenceStatus = async (req, res) => {
    try {
        const cycle = (req.query.cycle || 'odd').toLowerCase();

        // Get all teaching faculty (Faculty + LabAssistant, exclude Admin)
        // CIR-only and LabAssistant are pre-allocated, but we still show them in the count
        const allFaculty = await User.find({
            role: { $in: ['Faculty', 'LabAssistant'] }
        }).select('name email department isCirOnly role');

        // Get submitted preferences for this cycle
        const submitted = await FacultyPreference.find({ semesterCycle: cycle })
            .populate('faculty', 'name email department');

        // Filter out entries where the referenced faculty user no longer exists
        const validSubmissions = submitted.filter(p => p.faculty != null);
        const submittedIds = new Set(validSubmissions.map(p => p.faculty._id.toString()));

        // CIR-only and LabAssistant faculty are auto-allocated, mark them as submitted
        const facultyStatus = allFaculty.map(f => {
            const isAutoAllocated = f.isCirOnly || f.role === 'LabAssistant';
            return {
                _id: f._id,
                name: f.name,
                email: f.email,
                department: f.department,
                submitted: isAutoAllocated || submittedIds.has(f._id.toString()),
                autoAllocated: isAutoAllocated
            };
        });

        const submittedTotal = facultyStatus.filter(f => f.submitted).length;

        res.json({
            cycle,
            totalFaculty: allFaculty.length,
            submittedCount: submittedTotal,
            allSubmitted: submittedTotal >= allFaculty.length,
            faculty: facultyStatus
        });
    } catch (err) {
        console.error('Error fetching preference status:', err);
        res.status(500).json({ error: 'Failed to fetch preference status' });
    }
};

module.exports = {
    getCoursesForPreferences,
    getMyPreferences,
    submitPreferences,
    getPreferenceStatus
};
