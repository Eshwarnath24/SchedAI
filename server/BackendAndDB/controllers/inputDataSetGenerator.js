const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config();

// Load DB_models
const User = require("../DB_models/User");
const Room = require("../DB_models/Room");
const Course = require("../DB_models/Course");
const Section = require("../DB_models/Section");
const TimeSlot = require("../DB_models/timeSlot");
const Schedule = require("../DB_models/schedule");

// Connect to DB
mongoose.connect("mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI")
  .then(() => console.log('✅ MongoDB Connected for Seeding...'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // 1. CLEAR OLD DATA
    console.log('🗑️  Clearing old database...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await TimeSlot.deleteMany({});
    await Schedule.deleteMany({});

    // 2. CREATE TIME SLOTS (1-42)
    // Each day: 10 teaching periods + 2 breaks = 12 slots
    // Aligned with frontend constants.js SLOTS (IDs 1-12 per day)
    console.log('⏳ Creating Time Slots...');
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const daySlots = [
      { "start_time": "08:00", "end_time": "08:50", "is_break": false },   // Slot 1
      { "start_time": "08:50", "end_time": "09:40", "is_break": false },   // Slot 2
      { "start_time": "09:40", "end_time": "10:30", "is_break": false },   // Slot 3
      { "start_time": "10:30", "end_time": "10:45", "is_break": true },    // Break (Interval)
      { "start_time": "10:45", "end_time": "11:35", "is_break": false },   // Slot 4
      { "start_time": "11:35", "end_time": "12:25", "is_break": false },   // Slot 5
      { "start_time": "12:25", "end_time": "13:15", "is_break": false },   // Slot 6
      { "start_time": "13:15", "end_time": "14:05", "is_break": true },    // Break (Lunch)
      { "start_time": "14:05", "end_time": "14:55", "is_break": false },   // Slot 8
      { "start_time": "14:55", "end_time": "15:45", "is_break": false },   // Slot 9
      { "start_time": "15:45", "end_time": "16:35", "is_break": false },   // Slot 10
      { "start_time": "16:35", "end_time": "17:25", "is_break": false },   // Slot 11
      { "start_time": "17:25", "end_time": "18:15", "is_break": false }    // Slot 12
    ];

    const rawSlots = [];
    let slotId = 1;
    for (const day of days) {
      for (const s of daySlots) {
        rawSlots.push({
          id: slotId++,
          day: day,
          start_time: s.start_time,
          end_time: s.end_time,
          is_break: s.is_break
        });
      }
    }

    // Map JSON keys to Mongoose Schema keys
    const timeSlots = rawSlots.map(s => ({
      slotIndex: s.id,
      day: s.day,
      startTime: s.start_time,
      endTime: s.end_time,
      isBreak: s.is_break
    }));
    await TimeSlot.insertMany(timeSlots);
    console.log(`   ✅ Created ${timeSlots.length} time slots`);


    // 3. CREATE ROOMS
    console.log('🏛️  Creating Rooms...');
    const rawRooms = [
      { "name": "N-101", "capacity": 60, "type": "Lecture", "building": "North", "isAccessible": true },
      { "name": "N-102", "capacity": 60, "type": "Lecture", "building": "North", "isAccessible": true },
      { "name": "N-201", "capacity": 40, "type": "Lecture", "building": "North", "isAccessible": false },
      { "name": "N-202", "capacity": 40, "type": "Lecture", "building": "North", "isAccessible": false },
      { "name": "S-101", "capacity": 100, "type": "Lecture", "building": "South", "isAccessible": true },
      { "name": "S-102", "capacity": 30, "type": "Lecture", "building": "South", "isAccessible": true },
      { "name": "LAB-A", "capacity": 30, "type": "Lab", "building": "South", "isAccessible": true },
      { "name": "LAB-B", "capacity": 30, "type": "Lab", "building": "South", "isAccessible": false },
      { "name": "LAB-C", "capacity": 40, "type": "Lab", "building": "North", "isAccessible": true },
      { "name": "SEM-HALL", "capacity": 150, "type": "Lecture", "building": "Main", "isAccessible": true }
    ];
    await Room.insertMany(rawRooms);


    // 4. CREATE FACULTY (Regular, Lab Assistants, CIR Teachers)
    console.log('👨‍🏫 Creating Faculty...');
    const salt = await bcrypt.genSalt(10);

    // 4a. Regular Faculty (more teachers per subject for optimization)
    const rawFaculty = [
      { "id": "F-001", "name": "Dr. Smith", "rank": "Professor", "max_load": 12, "contracted_days": [], "unavailable": [1, 2, 3], "preferred_slots": [4, 5], "expertise": ["AI", "ML"] },
      { "id": "F-002", "name": "Prof. Johnson", "rank": "Professor", "max_load": 12, "contracted_days": [], "unavailable": [], "preferred_slots": [1, 2], "expertise": ["Networks"] },
      { "id": "F-003", "name": "Dr. Williams", "rank": "Assistant Prof", "max_load": 16, "contracted_days": [], "unavailable": [25, 26, 27], "preferred_slots": [], "expertise": ["Data Science"] },
      { "id": "F-004", "name": "Mr. Brown", "rank": "Adjunct", "max_load": 6, "contracted_days": ["Monday", "Wednesday"], "unavailable": [], "preferred_slots": [], "expertise": ["Web Dev"] },
      { "id": "F-005", "name": "Ms. Davis", "rank": "Adjunct", "max_load": 6, "contracted_days": ["Tuesday", "Thursday"], "unavailable": [], "preferred_slots": [], "expertise": ["Mobile Dev"] },
      { "id": "F-006", "name": "Dr. Miller", "rank": "Professor", "max_load": 10, "contracted_days": [], "unavailable": [1, 9, 17, 25, 33], "preferred_slots": [], "expertise": ["Algorithms"] },
      { "id": "F-007", "name": "Prof. Wilson", "rank": "Assistant Prof", "max_load": 16, "contracted_days": [], "unavailable": [], "preferred_slots": [1, 2, 3], "expertise": ["OS"] },
      { "id": "F-008", "name": "Dr. Taylor", "rank": "Professor", "max_load": 8, "contracted_days": [], "unavailable": [5, 6, 13, 14], "preferred_slots": [], "expertise": ["Compiler"] },
      // Additional faculty for better scheduling flexibility
      { "id": "F-009", "name": "Dr. Arun", "rank": "Assistant Prof", "max_load": 14, "contracted_days": [], "unavailable": [], "preferred_slots": [1, 2, 3], "expertise": ["AI", "ML"] },
      { "id": "F-010", "name": "Prof. Meena", "rank": "Assistant Prof", "max_load": 14, "contracted_days": [], "unavailable": [3, 16, 29], "preferred_slots": [], "expertise": ["Networks", "OS"] },
      { "id": "F-011", "name": "Dr. Karthik", "rank": "Professor", "max_load": 10, "contracted_days": [], "unavailable": [], "preferred_slots": [5, 6, 7], "expertise": ["Algorithms", "Data Science"] },
      { "id": "F-012", "name": "Ms. Lakshmi", "rank": "Assistant Prof", "max_load": 16, "contracted_days": [], "unavailable": [10, 11, 12], "preferred_slots": [], "expertise": ["Compiler", "OS"] },
      { "id": "F-013", "name": "Dr. Suresh", "rank": "Professor", "max_load": 12, "contracted_days": [], "unavailable": [], "preferred_slots": [1, 2], "expertise": ["Web Dev", "Mobile Dev"] },
      { "id": "F-014", "name": "Prof. Divya", "rank": "Assistant Prof", "max_load": 14, "contracted_days": [], "unavailable": [20, 21], "preferred_slots": [], "expertise": ["AI", "Data Science"] },
      { "id": "F-015", "name": "Mr. Vijay", "rank": "Assistant Prof", "max_load": 16, "contracted_days": [], "unavailable": [], "preferred_slots": [4, 5, 6], "expertise": ["Networks", "Compiler"] },
      { "id": "F-016", "name": "Dr. Anitha", "rank": "Professor", "max_load": 10, "contracted_days": [], "unavailable": [7, 8, 9], "preferred_slots": [], "expertise": ["Algorithms", "ML"] }
    ];

    // 4b. Lab Assistants (assigned to specific lab courses)
    const rawLabAssistants = [
      { "id": "LA-001", "name": "Mr. Kumar", "max_load": 20, "expertise": ["Programming", "OS"] },
      { "id": "LA-002", "name": "Ms. Priya", "max_load": 20, "expertise": ["Networks", "ML"] },
      { "id": "LA-003", "name": "Mr. Rajan", "max_load": 20, "expertise": ["Compiler", "Web Dev"] },
      { "id": "LA-004", "name": "Ms. Sneha", "max_load": 20, "expertise": ["Programming", "Data Science"] },
      { "id": "LA-005", "name": "Mr. Harish", "max_load": 20, "expertise": ["OS", "Networks"] }
    ];

    // 4c. CIR Teachers (Exclusive - do NOT teach other classes)
    const rawCirFaculty = [
      { "id": "CIR-001", "name": "Mr. Deepak", "cirSubType": "Verbal", "max_load": 18 },
      { "id": "CIR-002", "name": "Mr. Raghu Pradeep Nair", "cirSubType": "Technical", "max_load": 18 },
      { "id": "CIR-003", "name": "Ms. Aparna", "cirSubType": "Aptitude", "max_load": 18 }
    ];

    // Helper: Map "F-001" -> Mongo ObjectId
    const facultyMap = {};

    // Insert Regular Faculty
    for (const f of rawFaculty) {
      const newUser = await User.create({
        name: f.name,
        email: `${f.name.split(' ')[1].toLowerCase()}@cse.cb.amrita`,
        password: await bcrypt.hash(f.name.split(' ')[1].toLowerCase(), salt),
        role: 'Faculty',
        department: 'CSE',
        rank: f.rank,
        maxLoad: f.max_load,
        contractedDays: f.contracted_days,
        unavailableSlots: f.unavailable,
        preferredSlots: f.preferred_slots,
        expertise: f.expertise,
        isCirOnly: false,
        phoneNumber: `9${f.id.replace('F-', '').padStart(9, '0')}`
      });
      facultyMap[f.id] = newUser._id;
    }
    console.log(`   ✅ Created ${rawFaculty.length} regular faculty`);

    // Insert Lab Assistants
    for (const la of rawLabAssistants) {
      const newUser = await User.create({
        name: la.name,
        email: `${la.name.split(' ')[1].toLowerCase()}@cse.cb.amrita`,
        password: await bcrypt.hash(la.name.split(' ')[1].toLowerCase(), salt),
        role: 'LabAssistant',
        department: 'CSE',
        rank: 'Assistant Prof',
        maxLoad: la.max_load,
        expertise: la.expertise,
        isCirOnly: false,
        phoneNumber: `8${la.id.replace('LA-', '').padStart(9, '0')}`
      });
      facultyMap[la.id] = newUser._id;
    }
    console.log(`   ✅ Created ${rawLabAssistants.length} lab assistants`);

    // Insert CIR Faculty
    for (const cf of rawCirFaculty) {
      const newUser = await User.create({
        name: cf.name,
        email: `${cf.name.split(' ')[1].toLowerCase().replace(/\s/g, '')}@cse.cb.amrita`,
        password: await bcrypt.hash('cir123', salt),
        role: 'Faculty',
        department: 'CSE',
        rank: 'Assistant Prof',
        maxLoad: cf.max_load,
        expertise: ['CIR'],
        isCirOnly: true,
        cirSubType: cf.cirSubType,
        phoneNumber: `7${cf.id.replace('CIR-', '').padStart(9, '0')}`
      });
      facultyMap[cf.id] = newUser._id;
    }
    console.log(`   ✅ Created ${rawCirFaculty.length} CIR faculty`);

    // 4d. Admin User (single admin with full access)
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@cse.cb.amrita',
      password: await bcrypt.hash('admin123', salt),
      role: 'Admin',
      department: 'CSE',
      phoneNumber: '9999999999'
    });
    console.log(`   ✅ Created Admin user (email: admin@cse.cb.amrita)`);

    // 5. CREATE COURSES
    console.log('📚 Creating Courses...');
    const rawCourses = [
      // Theory Courses (All semester 5 for Year 3 sections)
      { "id": "CS301", "name": "Artificial Intelligence", "duration": 1, "type": "Theory", "faculty_id": "F-001" },
      { "id": "CS302", "name": "Computer Networks", "duration": 1, "type": "Theory", "faculty_id": "F-002" },
      { "id": "CS303", "name": "Networks Lab", "duration": 2, "type": "Lab", "faculty_id": "F-002", "lab_assistant": "LA-002" },
      { "id": "CS304", "name": "Machine Learning", "duration": 1, "type": "Theory", "faculty_id": "F-001" },
      { "id": "CS305", "name": "ML Lab", "duration": 2, "type": "Lab", "faculty_id": "F-001", "lab_assistant": "LA-002" },
      { "id": "CS306", "name": "Database Systems", "duration": 1, "type": "Theory", "faculty_id": "F-003" },
      { "id": "CS307", "name": "DBMS Lab", "duration": 2, "type": "Lab", "faculty_id": "F-003", "lab_assistant": "LA-005" },
      { "id": "CS308", "name": "Data Structures", "duration": 1, "type": "Theory", "faculty_id": "F-006" },
      { "id": "CS309", "name": "Algorithms", "duration": 1, "type": "Theory", "faculty_id": "F-006" },
      { "id": "CS310", "name": "OS Principles", "duration": 1, "type": "Theory", "faculty_id": "F-007" },
      { "id": "CS311", "name": "OS Lab", "duration": 2, "type": "Lab", "faculty_id": "F-007", "lab_assistant": "LA-001" },
      { "id": "CS312", "name": "Compiler Design", "duration": 1, "type": "Theory", "faculty_id": "F-008" },
      { "id": "CS313", "name": "Compiler Lab", "duration": 2, "type": "Lab", "faculty_id": "F-008", "lab_assistant": "LA-003" },
      { "id": "CS314", "name": "Software Engineering", "duration": 1, "type": "Theory", "faculty_id": "F-009" },
      { "id": "CS315", "name": "Cloud Computing", "duration": 1, "type": "Theory", "faculty_id": "F-010" },
      { "id": "CS316", "name": "Discrete Maths", "duration": 1, "type": "Theory", "faculty_id": "F-011" },
      { "id": "CS317", "name": "Deep Learning", "duration": 1, "type": "Theory", "faculty_id": "F-014" },
      { "id": "CS318", "name": "Cyber Security", "duration": 1, "type": "Theory", "faculty_id": "F-016" },
      { "id": "CS319", "name": "Java Programming", "duration": 1, "type": "Theory", "faculty_id": "F-015" },
      { "id": "CS320", "name": "Java Lab", "duration": 2, "type": "Lab", "faculty_id": "F-015", "lab_assistant": "LA-004" },
      { "id": "CS321", "name": "System Design", "duration": 1, "type": "Theory", "faculty_id": "F-012" },
      { "id": "CS322", "name": "Professional Ethics", "duration": 1, "type": "Theory", "faculty_id": "F-013" },
      { "id": "ELEC-1", "name": "Web Development", "duration": 1, "type": "Theory", "faculty_id": "F-004", "parallelGroup": "GRP_WEB_MOB" },
      { "id": "ELEC-2", "name": "Mobile Development", "duration": 1, "type": "Theory", "faculty_id": "F-005", "parallelGroup": "GRP_WEB_MOB" },

      // CIR Courses (3 continuous slots per section per week)
      { "id": "CIR-V", "name": "CIR Verbal", "duration": 1, "type": "CIR", "faculty_id": "CIR-001", "cirSubType": "Verbal" },
      { "id": "CIR-T", "name": "CIR Technical", "duration": 1, "type": "CIR", "faculty_id": "CIR-002", "cirSubType": "Technical" },
      { "id": "CIR-A", "name": "CIR Aptitude", "duration": 1, "type": "CIR", "faculty_id": "CIR-003", "cirSubType": "Aptitude" }
    ];

    // Helper: All CS3xx and ELEC courses are semester 5 (Year 3)
    const getSem = (code) => {
      if (code.startsWith('CS3') || code.startsWith('ELEC')) return 5;
      if (code.startsWith('CIR')) return 0; // CIR is cross-semester
      return 5; // Default: all courses assigned to semester 5
    };

    const courseMap = []; // To store created courses for Section linking

    for (const c of rawCourses) {
      const resolvedFacultyId = c.faculty_id ? facultyMap[c.faculty_id] : undefined;
      const resolvedLabAssistantId = c.lab_assistant ? facultyMap[c.lab_assistant] : null;

      const newCourse = await Course.create({
        code: c.id,
        name: c.name,
        credits: 3,
        type: c.type,
        duration: c.duration,
        semester: getSem(c.id),
        department: 'CSE',
        parallelGroup: c.parallelGroup || null,
        cirSubType: c.cirSubType || null,
        minWeeklyHours: 3,
        labAssistant: resolvedLabAssistantId
      });

      courseMap.push({ ...newCourse.toObject(), rawFacultyId: c.faculty_id });
    }
    console.log(`   ✅ Created ${rawCourses.length} courses (including 3 CIR)`);


    // 6. CREATE SECTIONS (Linking to Courses + Mentors)
    console.log('🎓 Creating Sections...');
    const rawSections = [
      { "id": "CSE-A", "size": 55, "year": 3, "access": false, "mentor": "F-001" },
      { "id": "CSE-B", "size": 55, "year": 3, "access": false, "mentor": "F-002" },
      { "id": "CSE-C", "size": 60, "year": 3, "access": false, "mentor": "F-003" },
      { "id": "CSE-D", "size": 45, "year": 3, "access": true, "mentor": "F-006" },
      { "id": "CSE-E", "size": 40, "year": 3, "access": false, "mentor": "F-007" },
      { "id": "CSE-F", "size": 40, "year": 3, "access": true, "mentor": "F-008" },
    ];

    const sectionMap = {};

    for (const s of rawSections) {
      const targetSem = (s.year * 2) - 1;

      // All sections get CIR courses (semester=0) + their semester courses
      const sectionCourses = courseMap
        .filter(c => c.semester === targetSem || c.semester === 0)
        .map(c => c._id);

      const mentorId = s.mentor ? facultyMap[s.mentor] : null;

      const newSection = await Section.create({
        name: s.id,
        department: 'CSE',
        year: s.year,
        studentCount: s.size,
        requiresAccess: s.access,
        courses: sectionCourses,
        mentor: mentorId
      });

      sectionMap[s.id] = newSection._id;

      // Also update the mentor faculty's mentorSection field
      if (mentorId) {
        await User.findByIdAndUpdate(mentorId, { mentorSection: newSection._id });
      }
    }
    console.log(`   ✅ Created ${rawSections.length} sections with mentor assignments`);

    console.log('✅ Full JSON Data Seeded Successfully!');
    process.exit();

  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedData();
