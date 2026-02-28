/**
 * Unit Tests: scheduleApiController endpoints (Mocked DB)
 */
const {
    getActiveSchedule,
    getTeacherSchedule,
    getSectionSchedule,
    getAllSections,
    getAllTeachers,
    getTimeSlots
} = require('../../BackendAndDB/controllers/scheduleApiController');

const Schedule = require('../../BackendAndDB/DB_models/schedule');
const User = require('../../BackendAndDB/DB_models/User');
const Section = require('../../BackendAndDB/DB_models/Section');
const TimeSlot = require('../../BackendAndDB/DB_models/timeSlot');

jest.mock('../../BackendAndDB/DB_models/schedule');
jest.mock('../../BackendAndDB/DB_models/User');
jest.mock('../../BackendAndDB/DB_models/Section');
jest.mock('../../BackendAndDB/DB_models/timeSlot');

const mockReq = (params = {}) => ({ params });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Helper to build chained .populate().populate()... pattern
const mockPopulateChain = (result) => {
    const chain = {
        populate: jest.fn().mockReturnThis()
    };
    // The last populate returns the result
    chain.populate.mockImplementation(() => {
        chain.populate = jest.fn().mockImplementation(() => {
            chain.populate = jest.fn().mockImplementation(() => {
                chain.populate = jest.fn().mockResolvedValue(result);
                return chain;
            });
            return chain;
        });
        return chain;
    });
    return chain;
};

describe('getActiveSchedule', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns 404 when no active schedule', async () => {
        const chain = mockPopulateChain(null);
        Schedule.findOne.mockReturnValue(chain);

        const req = mockReq();
        const res = mockRes();
        await getActiveSchedule(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns schedule grid on success', async () => {
        const mockSchedule = {
            _id: 'sched1',
            academicYear: '2025-2026',
            semester: 'Odd',
            fitnessScore: 95,
            classes: [{
                day: 'Monday',
                slotIndex: 1,
                course: { code: 'CS101', name: 'Intro', type: 'Theory' },
                room: { name: 'N-101' },
                faculty: { name: 'Dr. Smith', _id: { toString: () => 'fac1' } },
                section: { name: '1ST-A', _id: { toString: () => 'sec1' }, studentCount: 55, year: 1 }
            }]
        };

        const chain = mockPopulateChain(mockSchedule);
        Schedule.findOne.mockReturnValue(chain);

        const req = mockReq();
        const res = mockRes();
        await getActiveSchedule(req, res);

        expect(res.json).toHaveBeenCalled();
        const response = res.json.mock.calls[0][0];
        expect(response.scheduleId).toBe('sched1');
        expect(response.schedule).toBeDefined();
    });
});

describe('getTeacherSchedule', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns 404 when no active schedule', async () => {
        const chain = mockPopulateChain(null);
        Schedule.findOne.mockReturnValue(chain);

        const req = mockReq({ teacherId: 'fac1' });
        const res = mockRes();
        await getTeacherSchedule(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('filters classes for specific teacher', async () => {
        const mockSchedule = {
            classes: [
                {
                    day: 'Monday', slotIndex: 1,
                    course: { code: 'CS101', name: 'Intro', type: 'Theory' },
                    room: { name: 'N-101' },
                    faculty: { name: 'Dr. Smith', _id: { toString: () => 'fac1' } },
                    section: { name: '1ST-A', _id: { toString: () => 'sec1' }, studentCount: 55, year: 1 }
                },
                {
                    day: 'Tuesday', slotIndex: 7,
                    course: { code: 'CS201', name: 'DS', type: 'Theory' },
                    room: { name: 'N-102' },
                    faculty: { name: 'Dr. Miller', _id: { toString: () => 'fac2' } },
                    section: { name: '2ND-A', _id: { toString: () => 'sec2' }, studentCount: 60, year: 2 }
                }
            ]
        };
        const chain = mockPopulateChain(mockSchedule);
        Schedule.findOne.mockReturnValue(chain);
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ name: 'Dr. Smith', email: 'smith@univ.edu' })
        });

        const req = mockReq({ teacherId: 'fac1' });
        const res = mockRes();
        await getTeacherSchedule(req, res);

        expect(res.json).toHaveBeenCalled();
        const response = res.json.mock.calls[0][0];
        expect(response.teacher).toBeDefined();
        expect(response.schedule).toBeDefined();
    });
});

describe('getAllSections', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns array of sections', async () => {
        const mockSections = [
            { name: '1ST-A', year: 1, department: 'CSE', studentCount: 55 },
            { name: '2ND-A', year: 2, department: 'CSE', studentCount: 60 }
        ];
        Section.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockSections)
        });

        const req = mockReq();
        const res = mockRes();
        await getAllSections(req, res);

        expect(res.json).toHaveBeenCalledWith(mockSections);
    });

    test('returns 500 on DB error', async () => {
        Section.find.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error('DB down'))
        });

        const req = mockReq();
        const res = mockRes();
        await getAllSections(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('getAllTeachers', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns array of faculty', async () => {
        const mockTeachers = [
            { name: 'Dr. Smith', email: 'smith@univ.edu', department: 'CSE', rank: 'Professor' }
        ];
        User.find.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockTeachers)
        });

        const req = mockReq();
        const res = mockRes();
        await getAllTeachers(req, res);

        expect(res.json).toHaveBeenCalledWith(mockTeachers);
    });
});

describe('getTimeSlots', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns sorted time slots', async () => {
        const mockSlots = [
            { slotIndex: 1, day: 'Monday', startTime: '09:00', endTime: '10:00' },
            { slotIndex: 2, day: 'Monday', startTime: '10:00', endTime: '11:00' }
        ];
        TimeSlot.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockSlots)
        });

        const req = mockReq();
        const res = mockRes();
        await getTimeSlots(req, res);

        expect(res.json).toHaveBeenCalledWith(mockSlots);
    });
});
