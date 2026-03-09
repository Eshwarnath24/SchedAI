/**
 * Seed script for Student collection.
 * Creates 60 students: 10 per section across 6 sections (A-F).
 *
 * Roll number ranges:
 *   CB.SC.U4CSE23001 - CB.SC.U4CSE23010  → CSE A
 *   CB.SC.U4CSE23011 - CB.SC.U4CSE23020  → CSE B
 *   CB.SC.U4CSE23021 - CB.SC.U4CSE23030  → CSE C
 *   CB.SC.U4CSE23031 - CB.SC.U4CSE23040  → CSE D
 *   CB.SC.U4CSE23041 - CB.SC.U4CSE23050  → CSE E
 *   CB.SC.U4CSE23051 - CB.SC.U4CSE23060  → CSE F
 *
 * All students have password: "student123"
 *
 * Usage: node seedStudents.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from BackendAndDB/.env
dotenv.config({ path: path.join(__dirname, 'BackendAndDB', '.env') });

const Student = require('./BackendAndDB/DB_models/Student');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI";

const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const STUDENTS_PER_SECTION = 10;
const DEFAULT_PASSWORD = 'student123';

// First names pool for generating student names
const FIRST_NAMES = [
    'Aarav', 'Aditi', 'Arjun', 'Ananya', 'Bharath', 'Chaitra', 'Deepak', 'Divya',
    'Eshan', 'Fathima', 'Ganesh', 'Harini', 'Ishaan', 'Janani', 'Karthik', 'Lavanya',
    'Manoj', 'Nandini', 'Om', 'Priya', 'Rahul', 'Sanjana', 'Tarun', 'Uma',
    'Varun', 'Wafa', 'Yash', 'Zara', 'Aditya', 'Bhavya', 'Chetan', 'Disha',
    'Eshwar', 'Gauri', 'Hari', 'Isha', 'Jay', 'Kavya', 'Lokesh', 'Meera',
    'Nikhil', 'Oviya', 'Pranav', 'Rithika', 'Siddharth', 'Tanvi', 'Uday', 'Vidya',
    'Aakash', 'Brinda', 'Chirag', 'Dharani', 'Ekta', 'Farhan', 'Gowtham', 'Hema',
    'Indu', 'Jayant', 'Keerthi', 'Lakshmi'
];
const LAST_NAMES = [
    'Sharma', 'Patel', 'Reddy', 'Kumar', 'Nair', 'Iyer', 'Pillai', 'Menon',
    'Das', 'Singh', 'Gupta', 'Verma', 'Joshi', 'Rao', 'Bhat', 'Shetty',
    'Hegde', 'Kulkarni', 'Desai', 'Mishra', 'Agarwal', 'Chauhan', 'Tiwari', 'Pandey',
    'Saxena', 'Sethi', 'Arora', 'Kapoor', 'Mahajan', 'Banerjee'
];

const seedStudents = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected...');

        // Clear existing students
        await Student.deleteMany({});
        console.log('🗑️  Cleared existing students...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        const students = [];
        let globalIndex = 0;

        for (let sectionIdx = 0; sectionIdx < SECTION_LETTERS.length; sectionIdx++) {
            const sectionLetter = SECTION_LETTERS[sectionIdx];
            const sectionName = `CSE-${sectionLetter}`;

            for (let studentNum = 1; studentNum <= STUDENTS_PER_SECTION; studentNum++) {
                globalIndex++;
                const rollSuffix = String(globalIndex).padStart(3, '0');
                const rollNo = `CB.SC.U4CSE23${rollSuffix}`;

                const firstName = FIRST_NAMES[globalIndex - 1] || `Student${globalIndex}`;
                const lastName = LAST_NAMES[(globalIndex - 1) % LAST_NAMES.length];
                const name = `${firstName} ${lastName}`;
                const email = `${rollNo.toLowerCase()}@cb.students.amrita.edu`;

                students.push({
                    rollNo,
                    name,
                    email,
                    password: hashedPassword,
                    department: 'CSE',
                    year: 3,
                    batchYear: '23',
                    sectionLetter,
                    sectionName,
                    section: null, // Can be linked to Section model later if needed
                });
            }
        }

        const created = await Student.insertMany(students);
        console.log(`✅ Seeded ${created.length} students successfully!\n`);

        // Print summary
        console.log('📋 Student Summary:');
        console.log('─'.repeat(60));
        for (let i = 0; i < SECTION_LETTERS.length; i++) {
            const start = i * STUDENTS_PER_SECTION + 1;
            const end = (i + 1) * STUDENTS_PER_SECTION;
            const startRoll = `CB.SC.U4CSE23${String(start).padStart(3, '0')}`;
            const endRoll = `CB.SC.U4CSE23${String(end).padStart(3, '0')}`;
            console.log(`  CSE ${SECTION_LETTERS[i]}:  ${startRoll} → ${endRoll}`);
        }
        console.log('─'.repeat(60));
        console.log(`  Password for all: ${DEFAULT_PASSWORD}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seedStudents();
