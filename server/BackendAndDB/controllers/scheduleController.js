const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars (Required because we are running this file standalone)
dotenv.config({ path: '../.env' }); // Adjust path if your .env is in backend root

// Load DB_models
const Schedule = require('../DB_models/schedule');
const Room = require('../DB_models/Room');
const Course = require('../DB_models/Course');
const Section = require('../DB_models/Section');
const TimeSlot = require('../DB_models/timeSlot');
const User = require('../DB_models/User');
const FacultyPreference = require('../DB_models/FacultyPreference');

// ==========================================
// 1. THE MAIN FUNCTION (Generate Schedule)
// ==========================================
const generateSchedule = async () => {
    console.log("🚀 Starting Schedule Generation Process...");

    // A. CONNECT TO DB (Only needed for standalone testing)
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    }

    // B. FETCH DATA
    console.log("📥 Fetching data from MongoDB...");
    const rooms = await Room.find({});
    const faculty = await User.find({ role: { $in: ['Faculty', 'LabAssistant'] } });
    const courses = await Course.find({}).populate('labAssistant');
    const sections = await Section.find({});
    const slots = await TimeSlot.find({});

    // B2. FETCH FACULTY PREFERENCES
    const allPreferences = await FacultyPreference.find({});
    const preferenceMap = {};
    allPreferences.forEach(pref => {
        preferenceMap[pref.faculty.toString()] = pref.preferences
            .sort((a, b) => a.priority - b.priority) // Sort by priority before flattening
            .map(p => p.course.toString()); // Changed to flat array of course IDs
    });
    console.log(`   - Found ${allPreferences.length} faculty preference submissions`);

    // B3. PRE-ALLOCATE Lab & CIR Faculty
    // Lab assistants: match via Course.labAssistant field
    // CIR faculty: match via User.cirSubType → Course.cirSubType
    console.log("🔗 Pre-allocating Lab & CIR faculty...");

    const cirCourses = courses.filter(c => c.type === 'CIR');
    const labCourses = courses.filter(c => c.type === 'Lab'); // Added for lab assistant pre-allocation
    let labPreAllocCount = 0;
    let cirPreAllocCount = 0;

    faculty.forEach(f => {
        const fid = f._id.toString();

        // Skip if faculty already submitted preferences
        if (preferenceMap[fid] && preferenceMap[fid].length > 0) return;

        // Lab Assistants: find courses where this faculty is the labAssistant
        if (f.role === 'LabAssistant') {
            const matchingCourses = labCourses.filter(c => c.labAssistant && c.labAssistant.toString() === f._id.toString());
            if (matchingCourses.length > 0) {
                // Pre-assign their designated lab courses
                preferenceMap[fid] = matchingCourses.map(c => c._id.toString());
                labPreAllocCount++;
            }
        }

        // CIR-only faculty: match by cirSubType
        if (f.isCirOnly && f.cirSubType) {
            const matchingCourses = cirCourses.filter(c => c.cirSubType === f.cirSubType);
            if (matchingCourses.length > 0) {
                // Pre-assign all matching CIR courses
                preferenceMap[fid] = matchingCourses.map(c => c._id.toString());
                cirPreAllocCount++;
            }
        }
    });

    console.log(`   - Pre-allocated ${labPreAllocCount} lab faculty, ${cirPreAllocCount} CIR faculty`);

    console.log(`   - Found ${rooms.length} Rooms`);
    console.log(`   - Found ${faculty.length} Faculty`);
    console.log(`   - Found ${courses.length} Courses`);
    console.log(`   - Found ${sections.length} Sections`);

    if (rooms.length === 0 || faculty.length === 0) {
        throw new Error("Database appears empty. Run seed script first.");
    }

    // C. FORMAT DATA FOR RUST
    const inputData = {
        rooms: rooms.map(r => ({
            id: r._id.toString(),
            capacity: r.capacity,
            type: r.type,
            building: r.building,
            is_accessible: r.isAccessible
        })),
        faculty: faculty.map(f => ({
            id: f._id.toString(),
            name: f.name,
            rank: f.rank || "Assistant Prof",
            max_load: f.maxLoad || 12,
            contracted_days: f.contractedDays || [],
            unavailable: f.unavailableSlots || [],
            preferred_slots: f.preferredSlots || [],
            expertise: f.expertise || [],
            preferred_courses: preferenceMap[f._id.toString()] || [],
            teaching_history: [],
            role: f.role || "Faculty",
            mentor_section: f.mentorSection ? f.mentorSection.toString() : null,
            is_cir_only: f.isCirOnly || false,
            cir_sub_type: f.cirSubType || null
        })),
        courses: courses.map(c => ({
            id: c._id.toString(),
            name: c.name,
            duration: c.duration || 1,
            subject_type: c.type,
            faculty_id: null,
            parallel_group: c.parallelGroup || null,
            cir_sub_type: c.cirSubType || null,
            min_weekly_hours: c.minWeeklyHours || 3,
            lab_assistant_id: c.labAssistant ? c.labAssistant._id.toString() : null
        })),
        sections: sections.map(s => ({
            id: s._id.toString(),
            size: s.studentCount,
            year: s.year.toString(),
            requires_access: s.requiresAccess,
            mentor_id: s.mentor ? s.mentor.toString() : null
        })),
        slots: slots.map(s => ({
            id: s.slotIndex,
            day: s.day,
            start_time: s.startTime,
            end_time: s.endTime,
            is_break: s.isBreak
        }))
    };

    // D. SPAWN RUST PROCESS
    console.log("🔥 Spawning Rust Worker...");
    const rustBinaryPath = path.join(__dirname, 'scheduler_worker.exe');

    return new Promise((resolve, reject) => {
        const child = spawn(rustBinaryPath);
        let dataString = '';

        // Feed JSON to Rust
        child.stdin.write(JSON.stringify(inputData));
        child.stdin.end();

        // Listen for Output
        child.stdout.on('data', (chunk) => { dataString += chunk.toString(); });
        child.stderr.on('data', (chunk) => { console.log(`[Rust Log]: ${chunk.toString().trim()}`); });

        // Handle Completion
        child.on('close', async (code) => {
            if (code !== 0) {
                return reject(new Error(`Rust process failed with exit code ${code}`));
            }

            try {
                const result = JSON.parse(dataString);
                console.log(`✅ Success! Final Fitness: ${result.fitness}`);

                // SAVE TO DB
                await saveToDatabase(result);

                console.log("🎉 PROCESS COMPLETE.");
                resolve({ fitness: result.fitness, classCount: result.classes.length });
            } catch (err) {
                reject(new Error(`Failed to parse Rust output: ${err.message}`));
            }
        });

        child.on('error', (err) => {
            reject(new Error(`Failed to spawn Rust worker: ${err.message}`));
        });
    });
};

// ==========================================
// 2. SAVE HELPER
// ==========================================
const saveToDatabase = async (rustOutput) => {
    console.log("💾 Saving Schedule to Database...");

    // Deactivate old schedules
    await Schedule.updateMany({}, { isActive: false });

    const newSchedule = new Schedule({
        academicYear: "2025-2026",
        semester: "Odd",
        fitnessScore: rustOutput.fitness,
        isActive: true,
        classes: rustOutput.classes.map(cls => ({
            section: cls.section_id,
            course: cls.course_id,
            faculty: cls.faculty_id,
            room: cls.room_id,
            labAssistant: cls.lab_assistant_id || null,
            slotIndex: cls.slot_id,
            day: cls.day
        }))
    });

    await newSchedule.save();
    console.log("✅ Schedule Saved!");
};

// ==========================================
// 3. EXPRESS API HANDLER
// ==========================================
const generateScheduleApi = async (req, res) => {
    try {
        console.log("📡 Generate Schedule API called");
        const result = await generateSchedule();
        res.json({
            success: true,
            message: 'Timetable generated successfully!',
            fitness: result.fitness,
            classCount: result.classCount
        });
    } catch (error) {
        console.error("❌ generateScheduleApi error:", error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate timetable'
        });
    }
};

// ==========================================
// 4. MANUAL EXECUTION BLOCK
// ==========================================
// This check ensures it only runs if you execute 'node scheduleController.js' directly
if (require.main === module) {
    generateSchedule()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("❌ Error:", err);
            process.exit(1);
        });
}

// Export for actual server use
module.exports = { generateSchedule, generateScheduleApi };