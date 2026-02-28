/**
 * Unit Tests: reportController helper — calculateDuration
 */
const { calculateDuration } = require('../../BackendAndDB/controllers/reportController');

describe('calculateDuration()', () => {
    test('calculates 1 hour correctly (09:00 to 10:00)', () => {
        expect(calculateDuration('09:00', '10:00')).toBe(1);
    });

    test('calculates 2 hours correctly (10:00 to 12:00)', () => {
        expect(calculateDuration('10:00', '12:00')).toBe(2);
    });

    test('calculates 15-min break (11:00 to 11:15)', () => {
        expect(calculateDuration('11:00', '11:15')).toBe(0.25);
    });

    test('calculates 45-min lunch break (13:15 to 14:00)', () => {
        expect(calculateDuration('13:15', '14:00')).toBe(0.75);
    });

    test('returns 0 for same start and end time', () => {
        expect(calculateDuration('10:00', '10:00')).toBe(0);
    });

    test('returns default 1 when start is null', () => {
        expect(calculateDuration(null, '10:00')).toBe(1);
    });

    test('returns default 1 when end is null', () => {
        expect(calculateDuration('09:00', null)).toBe(1);
    });

    test('returns default 1 when both are null', () => {
        expect(calculateDuration(null, null)).toBe(1);
    });

    test('returns default 1 when both are undefined', () => {
        expect(calculateDuration(undefined, undefined)).toBe(1);
    });

    test('handles full-day span (08:00 to 17:00)', () => {
        expect(calculateDuration('08:00', '17:00')).toBe(9);
    });

    test('returns 0 (max of 0 and negative) if end is before start', () => {
        expect(calculateDuration('14:00', '10:00')).toBe(0);
    });
});
