/**
 * Client Unit Tests: constants.js data structure validation
 */
import { describe, test, expect } from 'vitest';
import { DAYS, SLOTS, ROOMS, COLORS, ACADEMIC_YEARS, SECTIONS, TEACHER_COURSES, INITIAL_EVENTS } from '../utils/constants.js';

describe('DAYS constant', () => {
    test('contains 6 days', () => {
        expect(DAYS).toHaveLength(6);
    });

    test('starts with Monday', () => {
        expect(DAYS[0]).toBe('Monday');
    });

    test('ends with Saturday', () => {
        expect(DAYS[5]).toBe('Saturday');
    });

    test('includes all weekdays', () => {
        expect(DAYS).toContain('Monday');
        expect(DAYS).toContain('Tuesday');
        expect(DAYS).toContain('Wednesday');
        expect(DAYS).toContain('Thursday');
        expect(DAYS).toContain('Friday');
    });
});

describe('ACADEMIC_YEARS constant', () => {
    test('contains 4 academic years', () => {
        expect(ACADEMIC_YEARS).toHaveLength(4);
    });

    test('covers 1st through 4th year', () => {
        expect(ACADEMIC_YEARS).toContain('1st Year');
        expect(ACADEMIC_YEARS).toContain('4th Year');
    });
});

describe('SECTIONS constant', () => {
    test('contains section labels', () => {
        expect(SECTIONS.length).toBeGreaterThanOrEqual(1);
        expect(SECTIONS).toContain('A');
    });
});

describe('SLOTS constant', () => {
    test('has correct number of slots (including breaks)', () => {
        expect(SLOTS.length).toBeGreaterThanOrEqual(10);
    });

    test('each slot has required fields (id, start, end, label)', () => {
        SLOTS.forEach(slot => {
            expect(slot).toHaveProperty('id');
            expect(slot).toHaveProperty('start');
            expect(slot).toHaveProperty('end');
            expect(slot).toHaveProperty('label');
        });
    });

    test('break slots are marked with isBreak flag', () => {
        const breaks = SLOTS.filter(s => s.isBreak);
        expect(breaks.length).toBeGreaterThanOrEqual(1);
        breaks.forEach(b => {
            expect(b.isBreak).toBe(true);
        });
    });

    test('time format is HH:MM', () => {
        const timeRegex = /^\d{2}:\d{2}$/;
        SLOTS.forEach(slot => {
            expect(slot.start).toMatch(timeRegex);
            expect(slot.end).toMatch(timeRegex);
        });
    });
});

describe('ROOMS constant', () => {
    test('has rooms defined', () => {
        expect(ROOMS.length).toBeGreaterThanOrEqual(1);
    });

    test('each room has required fields', () => {
        ROOMS.forEach(room => {
            expect(room).toHaveProperty('id');
            expect(room).toHaveProperty('name');
            expect(room).toHaveProperty('type');
            expect(room).toHaveProperty('capacity');
            expect(typeof room.capacity).toBe('number');
        });
    });

    test('includes different room types', () => {
        const types = [...new Set(ROOMS.map(r => r.type))];
        expect(types).toContain('Theory');
        expect(types).toContain('Lab');
    });

    test('all capacities are positive', () => {
        ROOMS.forEach(room => {
            expect(room.capacity).toBeGreaterThan(0);
        });
    });
});

describe('COLORS constant', () => {
    test('has colors for standard event types', () => {
        expect(COLORS).toHaveProperty('Theory');
        expect(COLORS).toHaveProperty('Lab');
        expect(COLORS).toHaveProperty('Review');
    });

    test('each color value is a non-empty string', () => {
        Object.values(COLORS).forEach(color => {
            expect(typeof color).toBe('string');
            expect(color.length).toBeGreaterThan(0);
        });
    });
});

describe('TEACHER_COURSES constant', () => {
    test('has courses defined', () => {
        expect(TEACHER_COURSES.length).toBeGreaterThanOrEqual(1);
    });

    test('each course has id, title, and years', () => {
        TEACHER_COURSES.forEach(course => {
            expect(course).toHaveProperty('id');
            expect(course).toHaveProperty('title');
            expect(course).toHaveProperty('years');
            expect(Array.isArray(course.years)).toBe(true);
        });
    });
});

describe('INITIAL_EVENTS constant', () => {
    test('has events for at least some days', () => {
        expect(Object.keys(INITIAL_EVENTS).length).toBeGreaterThanOrEqual(1);
    });

    test('Monday events have required fields', () => {
        const mondayEvents = INITIAL_EVENTS['Monday'] || [];
        mondayEvents.forEach(event => {
            expect(event).toHaveProperty('slotId');
            expect(event).toHaveProperty('code');
            expect(event).toHaveProperty('title');
            expect(event).toHaveProperty('room');
            expect(event).toHaveProperty('type');
        });
    });

    test('each event has a valid type', () => {
        const validTypes = ['Theory', 'Lab', 'Review', 'Meeting', 'Placement'];
        Object.values(INITIAL_EVENTS).forEach(dayEvents => {
            dayEvents.forEach(event => {
                expect(validTypes).toContain(event.type);
            });
        });
    });
});
