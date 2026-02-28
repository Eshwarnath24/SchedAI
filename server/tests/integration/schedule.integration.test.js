/**
 * Integration Tests: Schedule Routes
 * Tests /api/schedule/* against real Express + in-memory MongoDB
 */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../testApp');
const db = require('../setup');
const User = require('../../BackendAndDB/DB_models/User');
const Schedule = require('../../BackendAndDB/DB_models/schedule');
const Section = require('../../BackendAndDB/DB_models/Section');
const Course = require('../../BackendAndDB/DB_models/Course');
const Room = require('../../BackendAndDB/DB_models/Room');
const TimeSlot = require('../../BackendAndDB/DB_models/timeSlot');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.disconnect());

describe('Schedule Routes Integration', () => {
    let teacher, section, course, room;

    beforeEach(async () => {
        // Seed minimal data for schedule tests
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('pass', salt);

        teacher = await User.create({
            name: 'Dr. Smith', email: 'smith@univ.edu',
            password: hashedPw, role: 'Faculty', department: 'CSE', rank: 'Professor'
        });

        section = await Section.create({
            name: '1ST-A', year: 1, department: 'CSE', studentCount: 55
        });

        course = await Course.create({
            code: 'CS101', name: 'Intro to Programming',
            credits: 3, type: 'Theory', semester: 1, department: 'CSE'
        });

        room = await Room.create({
            name: 'N-101', building: 'North', capacity: 60, type: 'Lecture'
        });

        await TimeSlot.create({
            slotIndex: 1, day: 'Monday', startTime: '09:00', endTime: '10:00'
        });

        await TimeSlot.create({
            slotIndex: 2, day: 'Monday', startTime: '10:00', endTime: '11:00'
        });
    });

    describe('GET /api/schedule/active', () => {
        test('404 — when no active schedule exists', async () => {
            const res = await request(app).get('/api/schedule/active');
            expect(res.status).toBe(404);
            expect(res.body.error).toContain('No active schedule');
        });

        test('200 — returns active schedule as grid', async () => {
            await Schedule.create({
                academicYear: '2025-2026',
                semester: 'Odd',
                isActive: true,
                fitnessScore: 95,
                classes: [{
                    section: section._id,
                    course: course._id,
                    faculty: teacher._id,
                    room: room._id,
                    slotIndex: 1,
                    day: 'Monday'
                }]
            });

            const res = await request(app).get('/api/schedule/active');
            expect(res.status).toBe(200);
            expect(res.body.schedule).toBeDefined();
            expect(res.body.academicYear).toBe('2025-2026');
            expect(res.body.fitnessScore).toBe(95);
        });
    });

    describe('GET /api/schedule/teacher/:teacherId', () => {
        test('200 — returns filtered teacher schedule', async () => {
            const teacher2 = await User.create({
                name: 'Prof. Johnson', email: 'johnson@univ.edu',
                password: 'hashed', role: 'Faculty', department: 'CSE', rank: 'Professor'
            });

            await Schedule.create({
                academicYear: '2025-2026', semester: 'Odd', isActive: true,
                classes: [
                    { section: section._id, course: course._id, faculty: teacher._id, room: room._id, slotIndex: 1, day: 'Monday' },
                    { section: section._id, course: course._id, faculty: teacher2._id, room: room._id, slotIndex: 2, day: 'Monday' }
                ]
            });

            const res = await request(app).get(`/api/schedule/teacher/${teacher._id}`);
            expect(res.status).toBe(200);
            expect(res.body.teacher).toBeDefined();
            expect(res.body.schedule).toBeDefined();
        });

        test('404 — when no active schedule', async () => {
            const res = await request(app).get(`/api/schedule/teacher/${teacher._id}`);
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/schedule/section/:sectionId', () => {
        test('200 — returns filtered section schedule', async () => {
            await Schedule.create({
                academicYear: '2025-2026', semester: 'Odd', isActive: true,
                classes: [
                    { section: section._id, course: course._id, faculty: teacher._id, room: room._id, slotIndex: 1, day: 'Monday' }
                ]
            });

            const res = await request(app).get(`/api/schedule/section/${section._id}`);
            expect(res.status).toBe(200);
            expect(res.body.section).toBeDefined();
            expect(res.body.schedule).toBeDefined();
        });
    });

    describe('GET /api/schedule/sections', () => {
        test('200 — returns all sections', async () => {
            const res = await request(app).get('/api/schedule/sections');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0].name).toBe('1ST-A');
        });
    });

    describe('GET /api/schedule/teachers', () => {
        test('200 — returns all faculty', async () => {
            const res = await request(app).get('/api/schedule/teachers');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /api/schedule/timeslots', () => {
        test('200 — returns sorted time slots', async () => {
            const res = await request(app).get('/api/schedule/timeslots');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0].slotIndex).toBe(1);
            expect(res.body[1].slotIndex).toBe(2);
        });
    });
});
