/**
 * Integration Tests: Leave Routes
 * Tests /api/leaves/* against real Express + in-memory MongoDB
 */
const request = require('supertest');
const app = require('../testApp');
const db = require('../setup');
const User = require('../../BackendAndDB/DB_models/User');
const bcrypt = require('bcryptjs');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.disconnect());

describe('Leave Routes Integration', () => {
    let faculty;

    beforeEach(async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('pass', salt);
        faculty = await User.create({
            name: 'Dr. Test',
            email: 'test@univ.edu',
            password: hashedPw,
            role: 'Faculty',
            department: 'CSE',
            rank: 'Professor'
        });
    });

    describe('POST /api/leaves/apply-full', () => {
        test('201 — creates full day leave successfully', async () => {
            const res = await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '2027-08-10',
                    toDate: '2027-08-12',
                    message: 'Conference attendance'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.reason).toBe('Conference attendance');
        });

        test('400 — rejects invalid date format', async () => {
            const res = await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '10-08-2027',
                    toDate: '2027-08-12',
                    message: 'Bad date'
                });

            expect(res.status).toBe(400);
        });

        test('400 — rejects fromDate after toDate', async () => {
            const res = await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '2027-08-15',
                    toDate: '2027-08-10',
                    message: 'Reversed dates'
                });

            expect(res.status).toBe(400);
        });

        test('409 — rejects overlapping leave requests', async () => {
            // First request
            await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '2027-09-10',
                    toDate: '2027-09-15',
                    message: 'First leave'
                });

            // Overlapping request
            const res = await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '2027-09-12',
                    toDate: '2027-09-18',
                    message: 'Overlapping leave'
                });

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('Conflict');
        });
    });

    describe('POST /api/leaves/apply-slot', () => {
        test('201 — creates slot unavailability successfully', async () => {
            const res = await request(app)
                .post('/api/leaves/apply-slot')
                .send({
                    facultyId: faculty._id.toString(),
                    date: '2027-08-10',
                    startTime: '09:00',
                    endTime: '10:00',
                    message: 'Doctor appointment'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('Approved');
        });

        test('400 — rejects invalid time format', async () => {
            const res = await request(app)
                .post('/api/leaves/apply-slot')
                .send({
                    facultyId: faculty._id.toString(),
                    date: '2027-08-10',
                    startTime: '9am',
                    endTime: '10am',
                    message: 'Bad time format'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/leaves/history/:facultyId', () => {
        test('200 — returns separated leave and slot history', async () => {
            // Create one full day leave
            await request(app)
                .post('/api/leaves/apply-full')
                .send({
                    facultyId: faculty._id.toString(),
                    fromDate: '2027-10-01',
                    toDate: '2027-10-02',
                    message: 'Full day'
                });

            // Create one slot leave
            await request(app)
                .post('/api/leaves/apply-slot')
                .send({
                    facultyId: faculty._id.toString(),
                    date: '2027-11-01',
                    startTime: '09:00',
                    endTime: '10:00',
                    message: 'Slot'
                });

            const res = await request(app)
                .get(`/api/leaves/history/${faculty._id.toString()}`);

            expect(res.status).toBe(200);
            expect(res.body.leaveHistory).toBeDefined();
            expect(res.body.slotHistory).toBeDefined();
            expect(res.body.leaveHistory.length).toBeGreaterThanOrEqual(1);
            expect(res.body.slotHistory.length).toBeGreaterThanOrEqual(1);
        });

        test('200 — returns empty arrays for faculty with no history', async () => {
            const res = await request(app)
                .get(`/api/leaves/history/${faculty._id.toString()}`);

            expect(res.status).toBe(200);
            expect(res.body.leaveHistory).toHaveLength(0);
            expect(res.body.slotHistory).toHaveLength(0);
        });
    });
});
