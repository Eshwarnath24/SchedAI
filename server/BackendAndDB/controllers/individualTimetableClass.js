const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load DB_models
const Schedule = require('../DB_models/schedule');
const Section = require('../DB_models/Section');
const Course = require('../DB_models/Course');
const Room = require('../DB_models/Room');
const User = require('../DB_models/User'); // Required to populate faculty names

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

const checkClassTimetable = async () => {
  try {
    // 1. Find the Section (Class)
    // Let's look for "2ND-A" (Check your seed data for exact names)
    const className = "2ND-A"; 
    const section = await Section.findOne({ name: className });

    if (!section) {
      console.log(`❌ Class "${className}" not found!`);
      process.exit(1);
    }
    console.log(`🎓 Found Class: ${section.name} (Year: ${section.year})`);

    // 2. Fetch Active Schedule
    const schedule = await Schedule.findOne({ isActive: true })
      .populate('classes.course')
      .populate('classes.section')
      .populate('classes.room')
      .populate('classes.faculty'); // We want to see WHICH teacher is teaching them

    if (!schedule) {
      console.log("❌ No active schedule found.");
      process.exit(1);
    }

    // 3. FILTER BY SECTION ID
    const classTimetable = schedule.classes.filter(cls => 
      cls.section && cls.section._id.toString() === section._id.toString()
    );

    // 4. Print Table
    console.log(`\n📅 Timetable for Class ${section.name}:`);
    console.log("==============================================================================");
    console.log(`| ${"Day".padEnd(10)} | ${"Slot".padEnd(8)} | ${"Course".padEnd(20)} | ${"Room".padEnd(8)} | ${"Teacher".padEnd(15)} |`);
    console.log("==============================================================================");

    if (classTimetable.length === 0) {
      console.log("   No classes scheduled.");
    } else {
      // Sort by Day then Slot
      const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5 };
      
      classTimetable.sort((a, b) => {
        if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
        return a.slotIndex - b.slotIndex;
      });

      classTimetable.forEach(cls => {
        const teacherName = cls.faculty ? cls.faculty.name : "Unassigned";
        console.log(`| ${cls.day.padEnd(10)} | ${cls.slotIndex.toString().padEnd(8)} | ${cls.course.name.padEnd(20)} | ${cls.room.name.padEnd(8)} | ${teacherName.padEnd(15)} |`);
      });
    }
    console.log("==============================================================================");
    
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkClassTimetable();