/**
 * Script to assign Lab Assistants to lab classes in the active schedule.
 *
 * Logic: Find all LabAssistant users, find all Lab-type classes in the
 * active schedule, and distribute lab assistants across them (round-robin
 * by room - each lab assistant "owns" a room).
 *
 * Usage: node assignLabAssistants.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'BackendAndDB', '.env') });

const User = require('./BackendAndDB/DB_models/User');
const Schedule = require('./BackendAndDB/DB_models/schedule');
const Room = require('./BackendAndDB/DB_models/Room');
const Course = require('./BackendAndDB/DB_models/Course');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected...\n');

        // 1. Get all lab assistants
        const labAssistants = await User.find({ role: 'LabAssistant' }).select('name email');
        console.log(`Found ${labAssistants.length} Lab Assistants:`);
        labAssistants.forEach(la => console.log(`  - ${la.name} (${la.email})`));

        if (labAssistants.length === 0) {
            console.log('\n⚠️  No Lab Assistants found. Creating some...');
            // Need to create lab assistants — let's check what lab rooms exist
        }

        // 2. Get all lab rooms
        const labRooms = await Room.find({ type: 'Lab' }).select('name building');
        console.log(`\nFound ${labRooms.length} Lab Rooms:`);
        labRooms.forEach(r => console.log(`  - ${r.name} (${r.building})`));

        // 3. Get active schedule
        const schedule = await Schedule.findOne({ isActive: true })
            .populate('classes.course')
            .populate('classes.room')
            .populate('classes.faculty');

        if (!schedule) {
            console.log('\n❌ No active schedule found. Run the scheduler first.');
            process.exit(1);
        }

        // 4. Find all lab classes in the schedule
        const labClasses = schedule.classes.filter(cls =>
            cls.course && cls.course.type === 'Lab'
        );
        console.log(`\nFound ${labClasses.length} Lab classes in the active schedule:`);
        labClasses.forEach(cls => {
            console.log(`  - ${cls.course.code} (${cls.course.name}) | Room: ${cls.room?.name || 'TBA'} | Day: ${cls.day} | Slot: ${cls.slotIndex}`);
        });

        if (labClasses.length === 0) {
            console.log('\n⚠️  No lab classes in the schedule to assign.');
            process.exit(0);
        }

        // 5. If no lab assistants exist, create them — one per unique lab room
        let assistants = labAssistants;
        if (assistants.length === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            // Get unique lab rooms used in the schedule
            const uniqueLabRoomIds = [...new Set(
                labClasses
                    .filter(cls => cls.room)
                    .map(cls => cls.room._id.toString())
            )];

            const newAssistants = [];
            for (let i = 0; i < uniqueLabRoomIds.length; i++) {
                const room = labRooms.find(r => r._id.toString() === uniqueLabRoomIds[i]) ||
                    await Room.findById(uniqueLabRoomIds[i]);
                const roomName = room ? room.name : `Lab-${i + 1}`;

                newAssistants.push({
                    name: `Lab Asst. ${roomName}`,
                    email: `lab.${roomName.toLowerCase().replace(/[^a-z0-9]/g, '')}@univ.edu`,
                    password: hashedPassword,
                    role: 'LabAssistant',
                    department: 'CSE',
                    maxLoad: 20,
                    expertise: ['Lab Management'],
                });
            }

            assistants = await User.insertMany(newAssistants);
            console.log(`\n✅ Created ${assistants.length} Lab Assistants:`);
            assistants.forEach(a => console.log(`  - ${a.name} (${a.email})`));
        }

        // 6. Build room → lab assistant mapping (round-robin if more rooms than assistants)
        const uniqueLabRoomIds = [...new Set(
            labClasses
                .filter(cls => cls.room)
                .map(cls => cls.room._id.toString())
        )];

        const roomToAssistant = {};
        for (let i = 0; i < uniqueLabRoomIds.length; i++) {
            const assistant = assistants[i % assistants.length];
            roomToAssistant[uniqueLabRoomIds[i]] = assistant._id;
        }

        console.log('\n📋 Room → Lab Assistant Mapping:');
        for (const [roomId, assistantId] of Object.entries(roomToAssistant)) {
            const room = labRooms.find(r => r._id.toString() === roomId) || await Room.findById(roomId);
            const assistant = assistants.find(a => a._id.toString() === assistantId.toString());
            console.log(`  ${room?.name || roomId} → ${assistant?.name || assistantId}`);
        }

        // 7. Update the schedule — assign labAssistant to each lab class
        let updatedCount = 0;
        for (const cls of schedule.classes) {
            if (cls.course && cls.course.type === 'Lab' && cls.room) {
                const assistantId = roomToAssistant[cls.room._id.toString()];
                if (assistantId) {
                    cls.labAssistant = assistantId;
                    updatedCount++;
                }
            }
        }

        await schedule.save();
        console.log(`\n✅ Assigned lab assistants to ${updatedCount} lab classes in the active schedule!`);

        // 8. Verify: Now check if getTeacherSchedule would find classes for these lab assistants
        console.log('\n🔍 Verification — Lab assistant schedules:');
        for (const assistant of assistants) {
            const assignedClasses = schedule.classes.filter(cls =>
                cls.labAssistant && cls.labAssistant.toString() === assistant._id.toString()
            );
            console.log(`  ${assistant.name}: ${assignedClasses.length} classes`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

run();
