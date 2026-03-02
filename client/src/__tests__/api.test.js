/**
 * Client Unit Tests: api.js functions (Mocked fetch)
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
    loginApi,
    fetchActiveSchedule,
    fetchTeacherSchedule,
    fetchSectionSchedule,
    fetchSections,
    fetchTeachers,
    fetchTimeSlots
} from '../utils/api.js';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const expectFetchUrl = (expectedUrl) => {
    const [calledUrl] = mockFetch.mock.calls[0] || [];
    expect(calledUrl).toBe(expectedUrl);
};

beforeEach(() => {
    mockFetch.mockClear();
});

describe('loginApi()', () => {
    test('returns user data on successful login', async () => {
        const userData = { success: true, user: { name: 'Dr. Smith', role: 'Faculty' } };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(userData)
        });

        const result = await loginApi('smith@univ.edu', 'password123', 'teacher');
        expect(result).toEqual(userData);
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'smith@univ.edu', password: 'password123', role: 'teacher' })
        });
    });

    test('throws error on failed login', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: 'Invalid credentials' })
        });

        await expect(loginApi('bad@email.com', 'wrong', 'teacher'))
            .rejects.toThrow('Invalid credentials');
    });
});

describe('fetchActiveSchedule()', () => {
    test('returns schedule data on success', async () => {
        const scheduleData = { scheduleId: '123', schedule: {} };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(scheduleData)
        });

        const result = await fetchActiveSchedule();
        expect(result).toEqual(scheduleData);
        expectFetchUrl('/api/schedule/active');
    });

    test('throws error on failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found'
        });

        await expect(fetchActiveSchedule()).rejects.toThrow('Failed to fetch active schedule');
    });
});

describe('fetchTeacherSchedule()', () => {
    test('calls correct URL with teacher ID', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ teacher: {}, schedule: {} })
        });

        await fetchTeacherSchedule('teacher123');
        expectFetchUrl('/api/schedule/teacher/teacher123');
    });

    test('throws error on failure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Server Error' });
        await expect(fetchTeacherSchedule('t1')).rejects.toThrow('Failed to fetch teacher schedule');
    });
});

describe('fetchSectionSchedule()', () => {
    test('calls correct URL with section ID', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ section: {}, schedule: {} })
        });

        await fetchSectionSchedule('sec123');
        expectFetchUrl('/api/schedule/section/sec123');
    });

    test('throws error on failure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error' });
        await expect(fetchSectionSchedule('s1')).rejects.toThrow('Failed to fetch section schedule');
    });
});

describe('fetchSections()', () => {
    test('returns array of sections', async () => {
        const sections = [{ name: '1ST-A' }, { name: '2ND-A' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(sections)
        });

        const result = await fetchSections();
        expect(result).toEqual(sections);
        expectFetchUrl('/api/schedule/sections');
    });
});

describe('fetchTeachers()', () => {
    test('returns array of teachers', async () => {
        const teachers = [{ name: 'Dr. Smith' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(teachers)
        });

        const result = await fetchTeachers();
        expect(result).toEqual(teachers);
        expectFetchUrl('/api/schedule/teachers');
    });
});

describe('fetchTimeSlots()', () => {
    test('returns array of time slots', async () => {
        const slots = [{ slotIndex: 1, day: 'Monday' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(slots)
        });

        const result = await fetchTimeSlots();
        expect(result).toEqual(slots);
        expectFetchUrl('/api/schedule/timeslots');
    });

    test('throws error on failure', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error' });
        await expect(fetchTimeSlots()).rejects.toThrow('Failed to fetch time slots');
    });
});
