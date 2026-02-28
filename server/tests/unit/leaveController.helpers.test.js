/**
 * Unit Tests: leaveController helper — isValidDate
 */
const { isValidDate } = require('../../BackendAndDB/controllers/leaveController');

describe('isValidDate()', () => {
    // ─── Valid Dates ───
    test('accepts a valid date (2026-03-15)', () => {
        expect(isValidDate('2026-03-15')).toBe(true);
    });

    test('accepts Jan 1 boundary', () => {
        expect(isValidDate('2026-01-01')).toBe(true);
    });

    test('accepts Dec 31 boundary', () => {
        expect(isValidDate('2026-12-31')).toBe(true);
    });

    test('accepts leap year Feb 29', () => {
        expect(isValidDate('2028-02-29')).toBe(true);
    });

    // ─── Invalid Dates ───
    test('rejects non-existent date Feb 30', () => {
        expect(isValidDate('2026-02-30')).toBe(false);
    });

    test('rejects non-leap year Feb 29', () => {
        expect(isValidDate('2026-02-29')).toBe(false);
    });

    test('rejects wrong format DD-MM-YYYY', () => {
        expect(isValidDate('15-03-2026')).toBe(false);
    });

    test('rejects slash format', () => {
        expect(isValidDate('2026/03/15')).toBe(false);
    });

    test('rejects empty string', () => {
        expect(isValidDate('')).toBe(false);
    });

    test('rejects month 13', () => {
        expect(isValidDate('2026-13-01')).toBe(false);
    });

    test('rejects day 32', () => {
        expect(isValidDate('2026-01-32')).toBe(false);
    });

    test('rejects month 00', () => {
        expect(isValidDate('2026-00-15')).toBe(false);
    });

    test('rejects day 00', () => {
        expect(isValidDate('2026-03-00')).toBe(false);
    });

    test('rejects April 31', () => {
        expect(isValidDate('2026-04-31')).toBe(false);
    });

    test('rejects letters in date', () => {
        expect(isValidDate('20ab-03-15')).toBe(false);
    });
});
