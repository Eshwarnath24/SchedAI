/**
 * Integration Tests: Auth Routes
 * Tests POST /api/auth/login against real Express + in-memory MongoDB
 */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../testApp');
const db = require('../setup');
const User = require('../../BackendAndDB/DB_models/User');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.disconnect());

describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        testUser = await User.create({
            name: 'Dr. Smith',
            email: 'smith@univ.edu',
            password: hashedPassword,
            role: 'Faculty',
            department: 'CSE',
            rank: 'Professor'
        });
    });

    test('200 — successful login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'smith@univ.edu', password: 'password123', role: 'teacher' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe('Dr. Smith');
        expect(res.body.user.email).toBe('smith@univ.edu');
        expect(res.body.user.password).toBeUndefined();
    });

    test('400 — rejects request with missing email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
    });

    test('400 — rejects request with missing password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'smith@univ.edu' });

        expect(res.status).toBe(400);
    });

    test('401 — rejects wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'smith@univ.edu', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toContain('Incorrect password');
    });

    test('401 — rejects non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@univ.edu', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.error).toContain('No user found');
    });

    test('200 — matches user by username prefix (fuzzy match)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'smith@cb.teachers.amrita.edu', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe('Dr. Smith');
    });
});
