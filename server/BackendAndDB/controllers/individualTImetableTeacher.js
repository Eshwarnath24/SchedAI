const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load DB_models
const Schedule = require('../DB_models/schedule');
const User = require('../DB_models/User');
const Course = require('../DB_models/Course');
const Section = require('../DB_models/Section');
const Room = require('../DB_models/Room');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

const checkTeacherTimetable = async () => {
  try {
    // ======================================================
    // 1. CHANGE THIS NAME TO TEST DIFFERENT TEACHERS
    // ======================================================
    // Make sure this name exists exactly in your MongoDB 'users' collection
    const teacherName = "Prof. Johnson"; 
    
    // Find the Teacher in DB
    const teacher = await User.findOne({ name: teacherName });

    if (!teacher) {
      console.log(`❌ Teacher "${teacherName}" not found!`);
      process.exit(1);
    }
    console.log(`👨‍🏫 Found Teacher: ${teacher.name} (ID: ${teacher._id})`);

    // 2. Fetch the Active Master Schedule
    const schedule = await Schedule.findOne({ isActive: true })
      .populate('classes.course')
      .populate('classes.section')
      .populate('classes.room')
      .populate('classes.faculty');

    if (!schedule) {
      console.log("❌ No active schedule found in DB.");
      process.exit(1);
    }

    // 3. FILTER LOGIC: Get only this teacher's classes
    const myClasses = schedule.classes.filter(cls => 
      cls.faculty && cls.faculty._id.toString() === teacher._id.toString()
    );

    // 4. PRINT THE TABLE
    console.log(`\n📅 Timetable for ${teacher.name}:`);
    console.log("========================================================================");
    console.log(`| ${"Day".padEnd(10)} | ${"Time".padEnd(15)} | ${"Course".padEnd(20)} | ${"Room".padEnd(8)} |`);
    console.log("========================================================================");

    if (myClasses.length === 0) {
      console.log("   No classes scheduled.");
    } else {
      // Sort by Day (Mon-Fri) and then by Slot Index
      const dayOrder = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5 };
      
      myClasses.sort((a, b) => {
        if (dayOrder[a.day] !== dayOrder[b.day]) {
          return dayOrder[a.day] - dayOrder[b.day];
        }
        return a.slotIndex - b.slotIndex;
      });

      // Print the rows
      myClasses.forEach(cls => {
        const timeLabel = `Slot ${cls.slotIndex}`; 
        console.log(`| ${cls.day.padEnd(10)} | ${timeLabel.padEnd(15)} | ${cls.course.name.padEnd(20)} | ${cls.room.name.padEnd(8)} |`);
      });
    }
    console.log("========================================================================");
    
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTeacherTimetable();