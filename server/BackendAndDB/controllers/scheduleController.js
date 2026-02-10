const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars (Required because we are running this file standalone)
dotenv.config({ path: '../.env' }); // Adjust path if your .env is in backend root

// Load DB_models
const Schedule = require('../DB_models/Schedule');
const Room = require('../DB_models/Room');
const Course = require('../DB_models/Course');
const Section = require('../DB_models/Section');
const TimeSlot = require('../DB_models/timeSlot');
const User = require('../DB_models/User'); 

// ==========================================
// 1. THE MAIN FUNCTION (Generate Schedule)
// ==========================================
const generateSchedule = async () => {
    try {
        console.log("🚀 Starting Schedule Generation Process...");

        // A. CONNECT TO DB (Only needed for standalone testing)
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect("mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI");
            console.log("✅ MongoDB Connected");
        }

        // B. FETCH DATA
        console.log("📥 Fetching data from MongoDB...");
        const rooms = await Room.find({});
        const faculty = await User.find({ role: 'Faculty' }); // Ensure 'role' matches your seed data
        const courses = await Course.find({});
        const sections = await Section.find({});
        const slots = await TimeSlot.find({});

        console.log(`   - Found ${rooms.length} Rooms`);
        console.log(`   - Found ${faculty.length} Faculty`);
        console.log(`   - Found ${courses.length} Courses`);
        console.log(`   - Found ${sections.length} Sections`);

        if (rooms.length === 0 || faculty.length === 0) {
            console.error("❌ ERROR: Database appears empty. Run seed script first.");
            process.exit(1);
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
                preferred_courses: [],
                teaching_history: []
            })),
            courses: courses.map(c => ({
                id: c._id.toString(),
                name: c.name,
                duration: c.duration || 1,
                subject_type: c.type,
                faculty_id: null,
                parallel_group: c.parallelGroup || null
            })),
            sections: sections.map(s => ({
                id: s._id.toString(),
                size: s.studentCount,
                year: s.year.toString(),
                requires_access: s.requiresAccess
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
        const rustBinaryPath = path.join(__dirname,'scheduler_worker.exe'); 
        
        const child = spawn(rustBinaryPath);
        let dataString = '';
        let errorString = '';

        // Feed JSON to Rust
        child.stdin.write(JSON.stringify(inputData));
        child.stdin.end();

        // Listen for Output
        child.stdout.on('data', (chunk) => { dataString += chunk.toString(); });
        child.stderr.on('data', (chunk) => { console.log(`[Rust Log]: ${chunk.toString().trim()}`); });

        // Handle Completion
        child.on('close', async (code) => {
            if (code !== 0) {
                console.error(`❌ Rust process failed with code ${code}`);
                process.exit(1);
            }

            try {
                const result = JSON.parse(dataString);
                console.log(`✅ Success! Final Fitness: ${result.fitness}`);
                
                // SAVE TO DB
                await saveToDatabase(result);
                
                console.log("🎉 PROCESS COMPLETE. You can now start the server.");
                process.exit(0);
            } catch (err) {
                console.error("❌ Failed to parse Rust output:", err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        process.exit(1);
    }
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
            slotIndex: cls.slot_id,
            day: cls.day
        }))
    });

    await newSchedule.save();
    console.log("✅ Schedule Saved!");
};

// ==========================================
// 3. MANUAL EXECUTION BLOCK
// ==========================================
// This check ensures it only runs if you execute 'node scheduleController.js' directly
if (require.main === module) {
    generateSchedule();
}

// Export for actual server use later
module.exports = { generateSchedule };