/**
 * Unit Tests: scheduleApiController helpers — buildGrid & getColorForType
 */
const { buildGrid, getColorForType } = require('../../BackendAndDB/controllers/scheduleApiController');

describe('getColorForType()', () => {
    test('returns blue classes for Lab', () => {
        expect(getColorForType('Lab')).toBe('bg-blue-50 text-blue-700 border-blue-200');
    });

    test('returns green classes for Theory', () => {
        expect(getColorForType('Theory')).toBe('bg-green-50 text-green-700 border-green-200');
    });

    test('returns purple (default) for unknown type', () => {
        expect(getColorForType('Seminar')).toBe('bg-purple-50 text-purple-700 border-purple-200');
    });

    test('returns purple for undefined', () => {
        expect(getColorForType(undefined)).toBe('bg-purple-50 text-purple-700 border-purple-200');
    });
});

describe('buildGrid()', () => {
    test('returns initialized grid for empty array', () => {
        const grid = buildGrid([]);
        expect(grid).toHaveProperty('Monday');
        expect(grid).toHaveProperty('MONDAY');
        expect(grid).toHaveProperty('Tuesday');
        expect(grid).toHaveProperty('Friday');
        expect(Object.keys(grid['Monday'])).toHaveLength(0);
    });

    test('correctly maps global slotIndex to per-day slot', () => {
        // slotIndex 7 = Tuesday slot 1 (since SLOTS_PER_DAY=6: (7-1)%6+1 = 1)
        const classes = [{
            day: 'Tuesday',
            slotIndex: 7,
            course: { code: 'CS101', name: 'Intro', type: 'Theory' },
            room: { name: 'N-101' },
            faculty: { name: 'Dr. Smith', _id: { toString: () => 'fac1' } },
            section: { name: '1ST-A', _id: { toString: () => 'sec1' }, studentCount: 55, year: 1 }
        }];

        const grid = buildGrid(classes);
        expect(grid['Tuesday']['1']).toBeDefined();
        expect(grid['Tuesday']['1'].code).toBe('CS101');
        expect(grid['Tuesday']['1'].room).toBe('N-101');
        expect(grid['Tuesday']['1'].faculty).toBe('Dr. Smith');
    });

    test('stores entries under both proper case and uppercase keys', () => {
        const classes = [{
            day: 'Monday',
            slotIndex: 1,
            course: { code: 'CS101', name: 'Intro', type: 'Theory' },
            room: { name: 'N-101' },
            faculty: { name: 'Dr. Smith', _id: { toString: () => 'fac1' } },
            section: { name: '1ST-A', _id: { toString: () => 'sec1' }, studentCount: 55, year: 1 }
        }];

        const grid = buildGrid(classes);
        // slotIndex 1 => per-day slot 1
        expect(grid['Monday']['1']).toBeDefined();
        expect(grid['MONDAY']['1']).toBeDefined();
        expect(grid['Monday']['1'].code).toBe(grid['MONDAY']['1'].code);
    });

    test('skips entries with missing day', () => {
        const classes = [{
            day: null,
            slotIndex: 1,
            course: { code: 'CS101', name: 'Intro', type: 'Theory' },
            room: { name: 'N-101' },
            faculty: null,
            section: null
        }];

        const grid = buildGrid(classes);
        // No entries should have been added to any day
        expect(Object.keys(grid['Monday'])).toHaveLength(0);
        expect(Object.keys(grid['Tuesday'])).toHaveLength(0);
    });

    test('skips entries with null slotIndex', () => {
        const classes = [{
            day: 'Monday',
            slotIndex: null,
            course: { code: 'CS101', name: 'Intro', type: 'Theory' },
            room: { name: 'N-101' },
            faculty: null,
            section: null
        }];

        const grid = buildGrid(classes);
        expect(Object.keys(grid['Monday'])).toHaveLength(0);
    });

    test('handles missing course/room/faculty/section gracefully', () => {
        const classes = [{
            day: 'Wednesday',
            slotIndex: 13,
            course: null,
            room: null,
            faculty: null,
            section: null
        }];

        const grid = buildGrid(classes);
        // slotIndex 13 => (13-1)%6+1 = 1
        const entry = grid['Wednesday']['1'];
        expect(entry).toBeDefined();
        expect(entry.code).toBe('N/A');
        expect(entry.name).toBe('Unknown');
        expect(entry.room).toBe('TBA');
        expect(entry.faculty).toBe('Unassigned');
        expect(entry.section).toBe('N/A');
    });

    test('maps multiple classes on same day to different slots', () => {
        const mkClass = (slot) => ({
            day: 'Friday',
            slotIndex: slot,
            course: { code: `CS${slot}`, name: `Course ${slot}`, type: 'Theory' },
            room: { name: 'N-101' },
            faculty: { name: 'Dr. T', _id: { toString: () => 'f1' } },
            section: { name: 'A', _id: { toString: () => 's1' }, studentCount: 30, year: 2 }
        });

        const grid = buildGrid([mkClass(25), mkClass(26)]);
        // 25 => (25-1)%6+1 = 1, 26 => (26-1)%6+1 = 2
        expect(grid['Friday']['1']).toBeDefined();
        expect(grid['Friday']['2']).toBeDefined();
        expect(grid['Friday']['1'].code).toBe('CS25');
        expect(grid['Friday']['2'].code).toBe('CS26');
    });
});
