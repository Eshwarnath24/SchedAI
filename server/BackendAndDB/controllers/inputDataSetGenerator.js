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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // 1. CLEAR OLD DATA
    console.log("🗑️  Clearing old database...");
    await User.deleteMany({});
    await Room.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await TimeSlot.deleteMany({});
    await Schedule.deleteMany({});

    // 2. CREATE TIME SLOTS (1-30)
    console.log("⏳ Creating Time Slots...");
    const rawSlots = [
      {
        id: 1,
        day: "Monday",
        start_time: "09:00",
        end_time: "10:00",
        is_break: false,
      },
      {
        id: 2,
        day: "Monday",
        start_time: "10:00",
        end_time: "11:00",
        is_break: false,
      },
      {
        id: 3,
        day: "Monday",
        start_time: "11:00",
        end_time: "11:15",
        is_break: true,
      },
      {
        id: 4,
        day: "Monday",
        start_time: "11:15",
        end_time: "12:15",
        is_break: false,
      },
      {
        id: 5,
        day: "Monday",
        start_time: "12:15",
        end_time: "13:15",
        is_break: false,
      },
      {
        id: 6,
        day: "Monday",
        start_time: "13:15",
        end_time: "14:00",
        is_break: true,
      },
      {
        id: 7,
        day: "Tuesday",
        start_time: "09:00",
        end_time: "10:00",
        is_break: false,
      },
      {
        id: 8,
        day: "Tuesday",
        start_time: "10:00",
        end_time: "11:00",
        is_break: false,
      },
      {
        id: 9,
        day: "Tuesday",
        start_time: "11:00",
        end_time: "11:15",
        is_break: true,
      },
      {
        id: 10,
        day: "Tuesday",
        start_time: "11:15",
        end_time: "12:15",
        is_break: false,
      },
      {
        id: 11,
        day: "Tuesday",
        start_time: "12:15",
        end_time: "13:15",
        is_break: false,
      },
      {
        id: 12,
        day: "Tuesday",
        start_time: "13:15",
        end_time: "14:00",
        is_break: true,
      },
      {
        id: 13,
        day: "Wednesday",
        start_time: "09:00",
        end_time: "10:00",
        is_break: false,
      },
      {
        id: 14,
        day: "Wednesday",
        start_time: "10:00",
        end_time: "11:00",
        is_break: false,
      },
      {
        id: 15,
        day: "Wednesday",
        start_time: "11:00",
        end_time: "11:15",
        is_break: true,
      },
      {
        id: 16,
        day: "Wednesday",
        start_time: "11:15",
        end_time: "12:15",
        is_break: false,
      },
      {
        id: 17,
        day: "Wednesday",
        start_time: "12:15",
        end_time: "13:15",
        is_break: false,
      },
      {
        id: 18,
        day: "Wednesday",
        start_time: "13:15",
        end_time: "14:00",
        is_break: true,
      },
      {
        id: 19,
        day: "Thursday",
        start_time: "09:00",
        end_time: "10:00",
        is_break: false,
      },
      {
        id: 20,
        day: "Thursday",
        start_time: "10:00",
        end_time: "11:00",
        is_break: false,
      },
      {
        id: 21,
        day: "Thursday",
        start_time: "11:00",
        end_time: "11:15",
        is_break: true,
      },
      {
        id: 22,
        day: "Thursday",
        start_time: "11:15",
        end_time: "12:15",
        is_break: false,
      },
      {
        id: 23,
        day: "Thursday",
        start_time: "12:15",
        end_time: "13:15",
        is_break: false,
      },
      {
        id: 24,
        day: "Thursday",
        start_time: "13:15",
        end_time: "14:00",
        is_break: true,
      },
      {
        id: 25,
        day: "Friday",
        start_time: "09:00",
        end_time: "10:00",
        is_break: false,
      },
      {
        id: 26,
        day: "Friday",
        start_time: "10:00",
        end_time: "11:00",
        is_break: false,
      },
      {
        id: 27,
        day: "Friday",
        start_time: "11:00",
        end_time: "11:15",
        is_break: true,
      },
      {
        id: 28,
        day: "Friday",
        start_time: "11:15",
        end_time: "12:15",
        is_break: false,
      },
      {
        id: 29,
        day: "Friday",
        start_time: "12:15",
        end_time: "13:15",
        is_break: false,
      },
      {
        id: 30,
        day: "Friday",
        start_time: "13:15",
        end_time: "14:00",
        is_break: true,
      },
    ];

    // Map JSON keys to Mongoose Schema keys
    const timeSlots = rawSlots.map((s) => ({
      slotIndex: s.id,
      day: s.day,
      startTime: s.start_time,
      endTime: s.end_time,
      isBreak: s.is_break,
    }));
    await TimeSlot.insertMany(timeSlots);

    // 3. CREATE ROOMS
    console.log("🏛️  Creating Rooms...");
    const rawRooms = [
      {
        name: "N-101",
        capacity: 60,
        type: "Lecture",
        building: "North",
        isAccessible: true,
      },
      {
        name: "N-102",
        capacity: 60,
        type: "Lecture",
        building: "North",
        isAccessible: true,
      },
      {
        name: "N-201",
        capacity: 40,
        type: "Lecture",
        building: "North",
        isAccessible: false,
      },
      {
        name: "N-202",
        capacity: 40,
        type: "Lecture",
        building: "North",
        isAccessible: false,
      },
      {
        name: "S-101",
        capacity: 100,
        type: "Lecture",
        building: "South",
        isAccessible: true,
      },
      {
        name: "S-102",
        capacity: 30,
        type: "Lecture",
        building: "South",
        isAccessible: true,
      },
      {
        name: "LAB-A",
        capacity: 30,
        type: "Lab",
        building: "South",
        isAccessible: true,
      },
      {
        name: "LAB-B",
        capacity: 30,
        type: "Lab",
        building: "South",
        isAccessible: false,
      },
      {
        name: "LAB-C",
        capacity: 40,
        type: "Lab",
        building: "North",
        isAccessible: true,
      },
      {
        name: "SEM-HALL",
        capacity: 150,
        type: "Lecture",
        building: "Main",
        isAccessible: true,
      },
    ];
    await Room.insertMany(rawRooms);

    // 4. CREATE FACULTY (Handling the F-XXX IDs)
    console.log("👨‍🏫 Creating Faculty...");
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password123", salt);

    const rawFaculty = [
      {
        id: "F-001",
        name: "Dr. Smith",
        rank: "Professor",
        max_load: 12,
        contracted_days: [],
        unavailable: [1, 2, 3],
        preferred_slots: [4, 5],
        expertise: ["AI", "ML"],
      },
      {
        id: "F-002",
        name: "Prof. Johnson",
        rank: "Professor",
        max_load: 12,
        contracted_days: [],
        unavailable: [],
        preferred_slots: [1, 2],
        expertise: ["Networks"],
      },
      {
        id: "F-003",
        name: "Dr. Williams",
        rank: "Assistant Prof",
        max_load: 16,
        contracted_days: [],
        unavailable: [25, 26, 27],
        preferred_slots: [],
        expertise: ["Data Science"],
      },
      {
        id: "F-004",
        name: "Mr. Brown",
        rank: "Adjunct",
        max_load: 6,
        contracted_days: ["Monday", "Wednesday"],
        unavailable: [],
        preferred_slots: [],
        expertise: ["Web Dev"],
      },
      {
        id: "F-005",
        name: "Ms. Davis",
        rank: "Adjunct",
        max_load: 6,
        contracted_days: ["Tuesday", "Thursday"],
        unavailable: [],
        preferred_slots: [],
        expertise: ["Mobile Dev"],
      },
      {
        id: "F-006",
        name: "Dr. Miller",
        rank: "Professor",
        max_load: 10,
        contracted_days: [],
        unavailable: [1, 7, 13, 19, 25],
        preferred_slots: [],
        expertise: ["Algorithms"],
      },
      {
        id: "F-007",
        name: "Prof. Wilson",
        rank: "Assistant Prof",
        max_load: 16,
        contracted_days: [],
        unavailable: [],
        preferred_slots: [1, 2, 3],
        expertise: ["OS"],
      },
      {
        id: "F-008",
        name: "Dr. Taylor",
        rank: "Professor",
        max_load: 8,
        contracted_days: [],
        unavailable: [5, 6, 11, 12],
        preferred_slots: [],
        expertise: ["Compiler"],
      },
    ];

    // Helper: Map "F-001" -> Mongo ObjectId
    const facultyMap = {};

    for (const f of rawFaculty) {
      const newUser = await User.create({
        name: f.name,
        email: `${f.name.split(" ")[1].toLowerCase()}@univ.edu`, // e.g. smith@univ.edu
        password: password,
        role: "Faculty",
        department: "CSE",
        rank: f.rank,
        maxLoad: f.max_load,
        contractedDays: f.contracted_days,
        unavailableSlots: f.unavailable,
        preferredSlots: f.preferred_slots,
        expertise: f.expertise,
      });
      // Store the new DB ID against the old JSON ID
      facultyMap[f.id] = newUser._id;
    }

    // 5. CREATE COURSES (Linking to Faculty)
    console.log("📚 Creating Courses...");
    const rawCourses = [
      {
        id: "CS101",
        name: "Intro to Programming",
        duration: 1,
        type: "Theory",
        faculty_id: null,
      },
      {
        id: "CS102",
        name: "Digital Logic",
        duration: 1,
        type: "Theory",
        faculty_id: null,
      },
      {
        id: "CS103",
        name: "C++ Lab",
        duration: 2,
        type: "Lab",
        faculty_id: null,
      },
      {
        id: "CS201",
        name: "Data Structures",
        duration: 1,
        type: "Theory",
        faculty_id: "F-006",
      },
      {
        id: "CS202",
        name: "OS Principles",
        duration: 1,
        type: "Theory",
        faculty_id: "F-007",
      },
      {
        id: "CS203",
        name: "OS Lab",
        duration: 2,
        type: "Lab",
        faculty_id: "F-007",
      },
      {
        id: "CS204",
        name: "Algorithms",
        duration: 1,
        type: "Theory",
        faculty_id: "F-006",
      },
      {
        id: "CS301",
        name: "Artificial Intelligence",
        duration: 1,
        type: "Theory",
        faculty_id: "F-001",
      },
      {
        id: "CS302",
        name: "Computer Networks",
        duration: 1,
        type: "Theory",
        faculty_id: "F-002",
      },
      {
        id: "CS303",
        name: "Networks Lab",
        duration: 2,
        type: "Lab",
        faculty_id: "F-002",
      },
      {
        id: "CS304",
        name: "Machine Learning",
        duration: 1,
        type: "Theory",
        faculty_id: "F-001",
      },
      {
        id: "CS305",
        name: "ML Lab",
        duration: 2,
        type: "Lab",
        faculty_id: "F-001",
      },
      {
        id: "ELEC-1",
        name: "Web Development",
        duration: 1,
        type: "Theory",
        faculty_id: "F-004",
        parallelGroup: "GRP_WEB_MOB",
      },
      {
        id: "ELEC-2",
        name: "Mobile Development",
        duration: 1,
        type: "Theory",
        faculty_id: "F-005",
        parallelGroup: "GRP_WEB_MOB",
      },
      {
        id: "CS401",
        name: "Compiler Design",
        duration: 1,
        type: "Theory",
        faculty_id: "F-008",
      },
      {
        id: "CS402",
        name: "Compiler Lab",
        duration: 2,
        type: "Lab",
        faculty_id: "F-008",
      },
      {
        id: "CS403",
        name: "Project Phase 1",
        duration: 3,
        type: "Lab",
        faculty_id: null,
      },
      {
        id: "MATH101",
        name: "Calculus",
        duration: 1,
        type: "Theory",
        faculty_id: null,
      },
      {
        id: "ENG101",
        name: "Comm English",
        duration: 1,
        type: "Theory",
        faculty_id: null,
      },
      {
        id: "ETHICS",
        name: "Professional Ethics",
        duration: 1,
        type: "Theory",
        faculty_id: null,
      },
    ];

    // Helper: Map "CS1xx" -> Semester Number
    const getSem = (code) => {
      if (
        code.startsWith("CS1") ||
        code.startsWith("MATH") ||
        code.startsWith("ENG")
      )
        return 1;
      if (code.startsWith("CS2")) return 3;
      if (code.startsWith("CS3") || code.startsWith("ELEC")) return 5;
      if (code.startsWith("CS4")) return 7;
      return 1;
    };

    const courseMap = []; // To store created courses for Section linking

    for (const c of rawCourses) {
      // Resolve Faculty ID: "F-006" -> ObjectId("...")
      // If null in JSON, logic in Controller/Rust will handle it (or assign random)
      // Note: For now, if null, we leave it undefined in the schema
      const resolvedFacultyId = c.faculty_id
        ? facultyMap[c.faculty_id]
        : undefined;

      const newCourse = await Course.create({
        code: c.id,
        name: c.name,
        credits: 3, // Defaulting
        type: c.type,
        duration: c.duration,
        semester: getSem(c.id),
        department: "CSE",
        parallelGroup: c.parallelGroup || null,
      });

      // If we resolved a faculty, update the course to assign them?
      // Actually, your schema doesn't have 'faculty' in Course model (Course is abstract).
      // But your Rust input expects pre-assigned faculty in 'faculty_id'
      // So we don't save it in Mongo Course, but we WILL use it when generating Rust Input.

      courseMap.push(newCourse);
    }

    // 6. CREATE SECTIONS (Linking to Courses)
    console.log("🎓 Creating Sections...");
    const rawSections = [
      { id: "1ST-A", size: 55, year: 1, access: false },
      { id: "1ST-B", size: 55, year: 1, access: false },
      { id: "2ND-A", size: 60, year: 2, access: false },
      { id: "3RD-A", size: 45, year: 3, access: true },
      { id: "4TH-A", size: 40, year: 4, access: false },
    ];

    for (const s of rawSections) {
      // Logic: Assign courses to section based on Year
      // 1st Year Section takes Sem 1 courses
      // 2nd Year Section takes Sem 3 courses (Logic: Year 2 = Sem 3 & 4)
      const targetSem = s.year * 2 - 1;

      const sectionCourses = courseMap
        .filter((c) => c.semester === targetSem)
        .map((c) => c._id);

      await Section.create({
        name: s.id,
        department: "CSE",
        year: s.year,
        studentCount: s.size,
        requiresAccess: s.access,
        courses: sectionCourses,
      });
    }

    console.log("✅ Full JSON Data Seeded Successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
};

seedData();
