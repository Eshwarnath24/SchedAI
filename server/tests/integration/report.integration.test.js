/**
 * Integration Tests: Report Routes
 * Tests GET /api/reports/:facultyId against real Express + in-memory MongoDB
 */
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../testApp');
const db = require('../setup');
const User = require('../../BackendAndDB/DB_models/User');
const Course = require('../../BackendAndDB/DB_models/Course');
const Section = require('../../BackendAndDB/DB_models/Section');
const Workload = require('../../BackendAndDB/DB_models/workload');
const Schedule = require('../../BackendAndDB/DB_models/schedule');
const Room = require('../../BackendAndDB/DB_models/Room');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.disconnect());

describe('Report Routes Integration', () => {
    let teacher, course, section;

    beforeEach(async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('pass', salt);

        teacher = await User.create({
            name: 'Dr. Smith', email: 'smith@univ.edu',
            password: hashedPw, role: 'Faculty', department: 'CSE', rank: 'Professor'
        });

        course = await Course.create({
            code: 'CS101', name: 'Intro Programming',
            credits: 3, type: 'Theory', semester: 1, department: 'CSE'
        });

        section = await Section.create({
            name: '1ST-A', year: 1, department: 'CSE', studentCount: 55
        });
    });

    describe('GET /api/reports/:facultyId', () => {
        test('200 — returns faculty report with workload stats', async () => {
            // Create workload data
            await Workload.create({
                faculty: teacher._id,
                course: course._id,
                section: section._id,
                totalClassesScheduled: 20,
                classesCompleted: 15,
                syllabusProgress: 75,
                studentAttendanceAvg: 85
            });

            // Create an active schedule with a class
            const room = await Room.create({
                name: 'N-101', building: 'North', capacity: 60, type: 'Lecture'
            });

            await Schedule.create({
                academicYear: '2025-2026', semester: 'Odd', isActive: true,
                classes: [{
                    section: section._id, course: course._id,
                    faculty: teacher._id, room: room._id,
                    slotIndex: 1, day: 'Monday',
                    startTime: '09:00', endTime: '10:00'
                }]
            });

            const res = await request(app)
                .get(`/api/reports/${teacher._id}`);

            expect(res.status).toBe(200);
            expect(res.body.facultyDetails).toBeDefined();
            expect(res.body.facultyDetails.name).toBe('Dr. Smith');
            expect(res.body.facultyDetails.department).toBe('CSE');
            expect(res.body.workloadStats).toBeDefined();
            expect(res.body.workloadStats.totalWorkingHours).toBeGreaterThanOrEqual(0);
            expect(res.body.inventory).toBeDefined();
            expect(res.body.engagementCurve).toBeDefined();
            expect(res.body.engagementCurve.labels).toContain('Monday');
        });

        test('404 — returns not found for invalid faculty ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/reports/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toContain('Faculty not found');
        });

        test('200 — returns report with empty workloads', async () => {
            const res = await request(app)
                .get(`/api/reports/${teacher._id}`);

            expect(res.status).toBe(200);
            expect(res.body.workloadStats.totalWorkingHours).toBe(0);
            expect(res.body.inventory).toHaveLength(0);
        });
    });
});
