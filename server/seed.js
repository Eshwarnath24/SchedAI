const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load DB_models
const User = require('./DB_models/User');
const Room = require('./DB_models/Room');
const Course = require('./DB_models/Course');
const Section = require('./DB_models/Section');
const TimeSlot = require('./DB_models/timeSlot');
const Workload = require('./DB_models/workload');
const LeaveRequest = require('./DB_models/leaveRequest');
const Announcement = require('./DB_models/announcement');
const Task = require('./DB_models/task');
const Schedule = require('./DB_models/schedule');

// Helper function to combine Date + Time string into a Date Object
// (Needed to make Slot Unavailability work with your OLD Schema)
const combineDate = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00`);
};

// Connect to DB
mongoose.connect("mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI")
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await TimeSlot.deleteMany({});
    await Workload.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Announcement.deleteMany({});
    await Task.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Data Cleared...');

    // 2. Create Users (Faculty)
    // Password hashing (simulated for seed)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Dr. Robert Fox', // From your screenshot
        email: 'robert.fox@cse.cb.amrita',
        password: hashedPassword,
        role: 'Faculty',
        department: 'CSE',
        rank: 'Associate Prof',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        maxLoad: 12,
        expertise: ['Data Structures', 'Algorithms'],
        officeLocation: 'B-Block, 402'
      },
      {
        name: 'Dr. Alice Smith',
        email: 'alice@cse.cb.amrita',
        password: hashedPassword,
        role: 'Admin',
        department: 'CSE',
        rank: 'Professor',
        maxLoad: 8,
        expertise: ['AI', 'Machine Learning']
      }
    ]);

    const drFox = users[0];

    // 3. Create Rooms
    const rooms = await Room.insertMany([
      { name: 'N-101', building: 'North Block', capacity: 60, type: 'Lecture', isAccessible: true },
      { name: 'N-201', building: 'North Block', capacity: 60, type: 'Lecture', isAccessible: false },
      { name: 'Lab-A', building: 'South Block', capacity: 30, type: 'Lab', isAccessible: true, resources: ['Computers'] }
    ]);

    // 4. Create Courses (From "Academic Inventory" image)
    const courses = await Course.insertMany([
      { code: 'SUB-1', name: 'Data Structures', credits: 3, type: 'Theory', semester: 3, department: 'CSE' },
      { code: 'SUB-2', name: 'Algorithms Lab', credits: 2, type: 'Lab', duration: 3, semester: 3, department: 'CSE' },
      { code: 'SUB-3', name: 'Software Engineering', credits: 3, type: 'Theory', semester: 5, department: 'CSE' },
      { code: 'SUB-4', name: 'Special Seminar', credits: 1, type: 'Theory', semester: 7, department: 'CSE' }
    ]);

    // 5. Create Sections
    const sections = await Section.insertMany([
      { name: '3rd Year CSE-A', department: 'CSE', year: 3, studentCount: 55, courses: [courses[0]._id, courses[1]._id] },
      { name: '3rd Year CSE-B', department: 'CSE', year: 3, studentCount: 50, courses: [courses[0]._id, courses[1]._id] }
    ]);

    // 6. Create TimeSlots (Monday 9-4)
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];
    const timeSlots = [];
    let slotIndexCounter = 1;

    for (const time of times) {
      // Simple logic to create 1-hour slots
      const end = time.split(':')[0] * 1 + 1 + ":00";
      timeSlots.push({
        day: 'Monday',
        startTime: time,
        endTime: end.length === 4 ? "0" + end : end,
        slotIndex: slotIndexCounter++,
        isBreak: time === '12:00' // Lunch break
      });
    }
    await TimeSlot.insertMany(timeSlots);

    // 6.5 Create Schedule (For Report Module - Engagement Curve)
    await Schedule.create({
      semester: 'Odd 2025',
      academicYear: '2025-2026',
      isActive: true,
      classes: [
        {
          section: sections[0]._id,
          course: courses[0]._id,
          faculty: drFox._id,
          room: rooms[0]._id,
          day: 'Monday',
          slotIndex: 1,
          startTime: '09:00',
          endTime: '10:00'
        },
        {
          section: sections[0]._id,
          course: courses[1]._id, // Lab
          faculty: drFox._id,
          room: rooms[2]._id,
          day: 'Monday',
          slotIndex: 5,
          startTime: '14:00',
          endTime: '17:00' // 3 hour block
        },
        {
          section: sections[1]._id,
          course: courses[0]._id,
          faculty: drFox._id,
          room: rooms[1]._id,
          day: 'Tuesday',
          slotIndex: 8,
          startTime: '10:00',
          endTime: '11:00'
        },
        {
          section: sections[1]._id,
          course: courses[0]._id,
          faculty: drFox._id,
          room: rooms[1]._id,
          day: 'Wednesday',
          slotIndex: 14,
          startTime: '11:00',
          endTime: '12:00'
        }
      ]
    });

    // 7. Create Dashboard Data (Workload, Tasks, Announcements)

    // Workload for Dr. Fox (Matches screenshot stats)
    await Workload.create({
      faculty: drFox._id,
      course: courses[0]._id, // Data Structures
      section: sections[0]._id,
      hoursConducted: 7,
      syllabusProgress: 28, // Matches "28% Avg"
      studentAttendanceAvg: 88.4
    });

    // Announcements (Matches "Announcements" image)
    await Announcement.insertMany([
      {
        title: 'Campus Closure Notice',
        message: 'Due to heavy rainfall, the campus will remain closed tomorrow.',
        priority: 'High',
        sender: 'Administration',
        date: new Date('2024-03-14')
      },
      {
        title: 'Mid-Semester Exam Schedule',
        message: 'The schedule for Semester 6 has been released.',
        priority: 'Medium',
        sender: 'Academic Office',
        date: new Date('2024-03-12')
      }
    ]);

    // Tasks (Matches "Tasks" image)
    await Task.insertMany([
      { user: drFox._id, title: 'Grade OS Lab Reports', isCompleted: false },
      { user: drFox._id, title: 'Prepare Discrete Math Quiz', isCompleted: true },
      { user: drFox._id, title: 'CSE department head meeting', isCompleted: false }
    ]);

    // --- EXISTING LEAVE REQUEST (Generic) ---
    await LeaveRequest.create({
      faculty: drFox._id,
      fromDate: new Date(),
      toDate: new Date(),
      reason: 'Medical checkup',
      type: 'Sick',
      status: 'Pending'
    });

    // =======================================================
    // NEW ADDITIONS: SIMULATING THE "LEAVE APPLICATION" UI
    // =======================================================

    // 1. Full-day Leave Simulation
    // Matches Left Panel: Start Date, End Date, Message
    await LeaveRequest.create({
      faculty: drFox._id,
      fromDate: new Date('2026-02-15'),
      toDate: new Date('2026-02-17'),
      reason: 'Attending International Conference', // "Message"
      type: 'Casual', // Default type
      status: 'Pending'
    });
    console.log('✅ Added Simulation: Full-day Leave');

    // 2. Slot Unavailability Simulation
    // Matches Right Panel: Date (05-02-2026), Start (09:00), End (10:00)
    await LeaveRequest.create({
      faculty: drFox._id,
      // We combine Date + Time manually here so it fits your EXISTING Schema
      fromDate: combineDate('2026-02-05', '09:00'),
      toDate: combineDate('2026-02-05', '10:00'),
      reason: 'Dentist Appointment', // "Message"
      type: 'Duty', // Using 'Duty' to distinguish slots if you want
      status: 'Approved'
    });
    console.log('✅ Added Simulation: Slot Unavailability');

    console.log('✅ Database Seeded Successfully!');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();