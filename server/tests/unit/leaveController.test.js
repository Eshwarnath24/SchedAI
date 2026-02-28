/**
 * Unit Tests: leaveController endpoints (Mocked DB)
 */
const leaveController = require('../../BackendAndDB/controllers/leaveController');
const LeaveRequest = require('../../BackendAndDB/DB_models/leaveRequest');

jest.mock('../../BackendAndDB/DB_models/leaveRequest');

const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('leaveController.applyFullDayLeave', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns 400 for invalid date format', async () => {
        const req = mockReq({ facultyId: 'f1', fromDate: '15-03-2026', toDate: '2026-03-20', message: 'test' });
        const res = mockRes();
        await leaveController.applyFullDayLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 when fromDate > toDate', async () => {
        const req = mockReq({ facultyId: 'f1', fromDate: '2027-03-20', toDate: '2027-03-15', message: 'test' });
        const res = mockRes();
        await leaveController.applyFullDayLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 for non-existent date (Feb 30)', async () => {
        const req = mockReq({ facultyId: 'f1', fromDate: '2026-02-30', toDate: '2026-03-05', message: 'test' });
        const res = mockRes();
        await leaveController.applyFullDayLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 201 for valid full day leave application', async () => {
        // Use future dates to pass the past-date check
        const futureDate1 = '2027-06-15';
        const futureDate2 = '2027-06-20';
        LeaveRequest.findOne.mockResolvedValue(null); // No overlaps
        LeaveRequest.prototype.save = jest.fn().mockResolvedValue(true);

        const req = mockReq({ facultyId: 'f1', fromDate: futureDate1, toDate: futureDate2, message: 'vacation' });
        const res = mockRes();
        await leaveController.applyFullDayLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    test('returns 409 when leave overlaps with existing', async () => {
        const futureDate1 = '2027-07-10';
        const futureDate2 = '2027-07-15';
        LeaveRequest.findOne.mockResolvedValue({ _id: 'existing-leave' }); // Overlap found

        const req = mockReq({ facultyId: 'f1', fromDate: futureDate1, toDate: futureDate2, message: 'overlap' });
        const res = mockRes();
        await leaveController.applyFullDayLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
    });
});

describe('leaveController.applySlotLeave', () => {
    afterEach(() => jest.clearAllMocks());

    test('returns 400 for invalid date', async () => {
        const req = mockReq({ facultyId: 'f1', date: 'bad-date', startTime: '09:00', endTime: '10:00', message: 'test' });
        const res = mockRes();
        await leaveController.applySlotLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 for invalid time format', async () => {
        const req = mockReq({ facultyId: 'f1', date: '2027-06-15', startTime: '9am', endTime: '10:00', message: 'test' });
        const res = mockRes();
        await leaveController.applySlotLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 when start >= end', async () => {
        const req = mockReq({ facultyId: 'f1', date: '2027-06-15', startTime: '14:00', endTime: '10:00', message: 'test' });
        const res = mockRes();
        await leaveController.applySlotLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 201 for valid slot leave', async () => {
        LeaveRequest.findOne.mockResolvedValue(null);
        LeaveRequest.prototype.save = jest.fn().mockResolvedValue(true);

        const req = mockReq({ facultyId: 'f1', date: '2027-06-15', startTime: '09:00', endTime: '10:00', message: 'meeting' });
        const res = mockRes();
        await leaveController.applySlotLeave(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('leaveController.getHistory', () => {
    afterEach(() => jest.clearAllMocks());

    test('separates Duty (slots) from Casual (full day) leave', async () => {
        const mockData = [
            { type: 'Casual', reason: 'Sick', _id: '1' },
            { type: 'Duty', reason: 'Meeting', _id: '2' },
            { type: 'Casual', reason: 'Vacation', _id: '3' },
            { type: 'Duty', reason: 'Lab Setup', _id: '4' },
        ];

        LeaveRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockData)
        });

        const req = mockReq({}, { facultyId: 'f1' });
        const res = mockRes();
        await leaveController.getHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.leaveHistory).toHaveLength(2);
        expect(response.slotHistory).toHaveLength(2);
        expect(response.leaveHistory[0].type).toBe('Casual');
        expect(response.slotHistory[0].type).toBe('Duty');
    });

    test('returns empty arrays when no history exists', async () => {
        LeaveRequest.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const req = mockReq({}, { facultyId: 'f1' });
        const res = mockRes();
        await leaveController.getHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const response = res.json.mock.calls[0][0];
        expect(response.leaveHistory).toHaveLength(0);
        expect(response.slotHistory).toHaveLength(0);
    });

    test('returns 500 on DB error', async () => {
        LeaveRequest.find.mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('DB Error'))
        });

        const req = mockReq({}, { facultyId: 'f1' });
        const res = mockRes();
        await leaveController.getHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
