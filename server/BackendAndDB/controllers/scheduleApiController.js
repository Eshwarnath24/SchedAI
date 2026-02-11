const Schedule = require('../DB_models/schedule');
const User = require('../DB_models/User');
const Section = require('../DB_models/Section');
const Course = require('../DB_models/Course');
const Room = require('../DB_models/Room');
const TimeSlot = require('../DB_models/timeSlot');

// ==========================================
// HELPER: Transform flat classes array into
// { [day]: { [slotIndex]: { code, name, room, ... } } }
// grid shape that the frontend TimetableGrid expects
//
// CRITICAL: The DB stores global slotIndex (1-30, with 6 per day).
// The frontend expects per-day slot IDs (1-6 repeating each day).
// We convert: perDaySlot = ((globalSlotIndex - 1) % SLOTS_PER_DAY) + 1
// ==========================================
const SLOTS_PER_DAY = 6; // From the seed data: 6 slots per day (4 teaching + 2 breaks)

const buildGrid = (classes) => {
    const grid = {};
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Initialize both proper case and uppercase keys for compatibility
    DAYS.forEach(d => {
        grid[d] = {};
        grid[d.toUpperCase()] = {};
    });

    classes.forEach(cls => {
        if (!cls.day || cls.slotIndex == null) return;

        // Convert global slotIndex to per-day slotIndex
        const perDaySlot = ((cls.slotIndex - 1) % SLOTS_PER_DAY) + 1;

        const entry = {
            code: cls.course ? cls.course.code : 'N/A',
            name: cls.course ? cls.course.name : 'Unknown',
            room: cls.room ? cls.room.name : 'TBA',
            type: cls.course ? cls.course.type : 'Theory',
            color: getColorForType(cls.course ? cls.course.type : 'Theory'),
            faculty: cls.faculty ? cls.faculty.name : 'Unassigned',
            facultyId: cls.faculty ? cls.faculty._id.toString() : null,
            section: cls.section ? cls.section.name : 'N/A',
            sectionId: cls.section ? cls.section._id.toString() : null,
            studentCount: cls.section ? cls.section.studentCount : 0,
            year: cls.section ? `Year ${cls.section.year}` : '',
            globalSlotIndex: cls.slotIndex, // Keep original for reference
        };

        // Store under both day formats so both Faculty and Student pages work
        if (!grid[cls.day]) grid[cls.day] = {};
        grid[cls.day][perDaySlot.toString()] = entry;

        const upperDay = cls.day.toUpperCase();
        if (!grid[upperDay]) grid[upperDay] = {};
        grid[upperDay][perDaySlot.toString()] = entry;
    });

    return grid;
};

const getColorForType = (type) => {
    switch (type) {
        case 'Lab': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Theory': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
};

// ==========================================
// 1. GET /api/schedule/active
//    Returns the full active schedule as a grid
// ==========================================
const getActiveSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOne({ isActive: true })
            .populate('classes.course')
            .populate('classes.section')
            .populate('classes.room')
            .populate('classes.faculty');

        if (!schedule) {
            return res.status(404).json({ error: 'No active schedule found. Run the scheduler first.' });
        }

        const grid = buildGrid(schedule.classes);

        res.json({
            scheduleId: schedule._id,
            academicYear: schedule.academicYear,
            semester: schedule.semester,
            fitnessScore: schedule.fitnessScore,
            schedule: grid
        });
    } catch (err) {
        console.error('❌ getActiveSchedule error:', err);
        res.status(500).json({ error: 'Server error fetching schedule.' });
    }
};

// ==========================================
// 2. GET /api/schedule/teacher/:teacherId
//    Returns classes for a specific teacher as a grid
// ==========================================
const getTeacherSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const schedule = await Schedule.findOne({ isActive: true })
            .populate('classes.course')
            .populate('classes.section')
            .populate('classes.room')
            .populate('classes.faculty');

        if (!schedule) {
            return res.status(404).json({ error: 'No active schedule found.' });
        }

        const teacherClasses = schedule.classes.filter(cls =>
            cls.faculty && cls.faculty._id.toString() === teacherId
        );

        const grid = buildGrid(teacherClasses);

        // Get teacher info
        const teacher = await User.findById(teacherId).select('name email department rank');

        res.json({
            teacher: teacher || { name: 'Unknown' },
            schedule: grid
        });
    } catch (err) {
        console.error('❌ getTeacherSchedule error:', err);
        res.status(500).json({ error: 'Server error fetching teacher schedule.' });
    }
};

// ==========================================
// 3. GET /api/schedule/section/:sectionId
//    Returns classes for a specific section as a grid
// ==========================================
const getSectionSchedule = async (req, res) => {
    try {
        const { sectionId } = req.params;

        const schedule = await Schedule.findOne({ isActive: true })
            .populate('classes.course')
            .populate('classes.section')
            .populate('classes.room')
            .populate('classes.faculty');

        if (!schedule) {
            return res.status(404).json({ error: 'No active schedule found.' });
        }

        const sectionClasses = schedule.classes.filter(cls =>
            cls.section && cls.section._id.toString() === sectionId
        );

        const grid = buildGrid(sectionClasses);

        // Get section info
        const section = await Section.findById(sectionId);

        res.json({
            section: section || { name: 'Unknown' },
            schedule: grid
        });
    } catch (err) {
        console.error('❌ getSectionSchedule error:', err);
        res.status(500).json({ error: 'Server error fetching section schedule.' });
    }
};

// ==========================================
// 4. GET /api/schedule/sections
//    Returns all sections for dropdowns
// ==========================================
const getAllSections = async (req, res) => {
    try {
        const sections = await Section.find({}).select('name year department studentCount');
        res.json(sections);
    } catch (err) {
        console.error('❌ getAllSections error:', err);
        res.status(500).json({ error: 'Server error fetching sections.' });
    }
};

// ==========================================
// 5. GET /api/schedule/teachers
//    Returns all faculty for dropdowns
// ==========================================
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Faculty' }).select('name email department rank');
        res.json(teachers);
    } catch (err) {
        console.error('❌ getAllTeachers error:', err);
        res.status(500).json({ error: 'Server error fetching teachers.' });
    }
};

// ==========================================
// 6. GET /api/schedule/timeslots
//    Returns all time slots (for frontend grid headers)
// ==========================================
const getTimeSlots = async (req, res) => {
    try {
        const slots = await TimeSlot.find({}).sort({ slotIndex: 1 });
        res.json(slots);
    } catch (err) {
        console.error('❌ getTimeSlots error:', err);
        res.status(500).json({ error: 'Server error fetching time slots.' });
    }
};

module.exports = {
    getActiveSchedule,
    getTeacherSchedule,
    getSectionSchedule,
    getAllSections,
    getAllTeachers,
    getTimeSlots
};
