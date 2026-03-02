/**
 * Unit Tests: authController.loginUser (Mocked DB)
 * 
 * bcryptjs is mocked via jest.mock with a factory. We require
 * the mock reference BEFORE importing the controller so they share
 * the same object in Node's module cache.
 */

// Mock Mongoose User model  
jest.mock('../../BackendAndDB/DB_models/User');

// bcryptjs manual mock — the factory returns a fresh mock object
// that Jest will inject into *every* require('bcryptjs') call.
jest.mock('bcryptjs', () => {
    return {
        compare: jest.fn().mockResolvedValue(false), // default: password mismatch
        genSalt: jest.fn().mockResolvedValue('salt'),
        hash: jest.fn().mockResolvedValue('hashed'),
    };
});

// Now require — both test and controller get the same mock object
const bcrypt = require('bcryptjs');
const User = require('../../BackendAndDB/DB_models/User');
const { loginUser } = require('../../BackendAndDB/controllers/authController');

// Test helper: create mock req/res
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('authController.loginUser', () => {
    beforeEach(() => {
        // Reset call counts only, keep implementations intact
        User.findOne.mockReset();
        bcrypt.compare.mockReset();
        // Set default — password does NOT match
        bcrypt.compare.mockResolvedValue(false);
    });

    test('returns 400 if email is missing', async () => {
        const req = mockReq({ password: 'test123' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('required') })
        );
    });

    test('returns 400 if password is missing', async () => {
        const req = mockReq({ email: 'test@univ.edu' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 401 if user not found', async () => {
        User.findOne.mockResolvedValue(null);
        const req = mockReq({ email: 'nobody@univ.edu', password: 'test123' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('No user found') })
        );
    });

    test('returns 401 if password is incorrect', async () => {
        User.findOne.mockResolvedValue({ _id: '123', email: 'smith@univ.edu', password: 'hashedpw' });
        // bcrypt.compare defaults to false (password mismatch)
        const req = mockReq({ email: 'smith@univ.edu', password: 'wrongpw' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('Incorrect password') })
        );
    });

    test('returns 403 if role mismatch', async () => {
        User.findOne.mockResolvedValue({
            _id: '123', email: 'smith@univ.edu', password: 'hashed',
            role: 'Admin', name: 'Smith', department: 'CSE'
        });
        bcrypt.compare.mockResolvedValue(true); // password matches
        const req = mockReq({ email: 'smith@univ.edu', password: 'pw', role: 'teacher' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('Access denied') })
        );
    });

    test('returns user data on successful login (no password in response)', async () => {
        const fakeUser = {
            _id: 'abc123', name: 'Dr. Smith', email: 'smith@univ.edu',
            password: 'hashed_secret', role: 'Faculty', department: 'CSE',
            rank: 'Professor', officeLocation: 'B-201', phone: '1234567890'
        };
        User.findOne.mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true); // password matches

        const req = mockReq({ email: 'smith@univ.edu', password: 'password123', role: 'teacher' });
        const res = mockRes();
        await loginUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                user: expect.objectContaining({
                    name: 'Dr. Smith',
                    email: 'smith@univ.edu',
                    role: 'Faculty'
                })
            })
        );
        // Ensure password is NOT in the response
        const responseData = res.json.mock.calls[0][0];
        expect(responseData.user.password).toBeUndefined();
    });

    test('returns 500 on internal server error', async () => {
        User.findOne.mockRejectedValue(new Error('DB connection failed'));
        const req = mockReq({ email: 'smith@univ.edu', password: 'pw' });
        const res = mockRes();
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
