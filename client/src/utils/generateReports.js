/**
 * Faculty Activity Report Generator
 * ──────────────────────────────────
 * Builds a deterministic, traceable report of what a specific faculty member
 * has done / is doing for the current semester week.
 *
 * Every report entry maps 1-to-1 to a timetable event.
 * No workload-optimization or fairness logic lives here.
 */

import { DAYS, SLOTS } from './constants';

// ────────────────────────── helpers ──────────────────────────

/** Resolve the human-readable slot time range for a slot id */
function slotMeta(slotId) {
    const slot = SLOTS.find(s => s.id === slotId);
    if (!slot) return { start: '--:--', end: '--:--', label: `Slot ${slotId}`, duration: 1 };
    return { start: slot.start, end: slot.end, label: slot.label, duration: 1 };
}

/** Return the weekday name for the current date */
function todayDayName() {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

// ───────────────── main: build faculty activity report ─────────────────

/**
 * Build a full activity report for exactly ONE faculty member.
 *
 * @param {Object}  params
 * @param {string}  params.facultyId   – logged-in faculty id (e.g. "T001")
 * @param {string}  params.facultyName
 * @param {Object}  params.events      – { Monday: [...], … } from AppContext
 * @param {Array}   params.assignedCourses – teacher.courses from database.js
 * @param {number}  params.maxWeeklyHours
 * @returns {Object} report
 */
export function buildFacultyActivityReport({
    facultyId,
    facultyName,
    events,
    assignedCourses = [],
    maxWeeklyHours = 20,
}) {
    if (!facultyId || !events) {
        return emptyReport(facultyId, facultyName, maxWeeklyHours);
    }

    // ── Collect every entry that belongs to this faculty ──
    const entries = [];          // flat list of report rows
    const byDay = {};            // day → [entries]
    const bySubject = {};        // courseName → { theory, lab, extra, substitute, cancelled, total }
    const byWeek = { current: [] }; // single-week scope (semester-week expandable later)

    let totalTheoryHours = 0;
    let totalLabHours = 0;
    let totalExtraHours = 0;
    let totalSubstituteHours = 0;
    let totalCancelledHours = 0;
    let totalScheduledHours = 0;
    let totalCompletedHours = 0;
    let totalNonTeachingCount = 0;
    const nonTeachingEntries = [];

    // Track consecutive hours per day for detection
    const consecutiveMap = {}; // day → [slotIds sorted]

    DAYS.forEach(day => {
        const dayEvents = events[day] || [];
        byDay[day] = [];

        dayEvents.forEach(ev => {
            // Determine class category
            const classType = resolveClassType(ev);
            const isTeaching = ['Theory', 'Lab', 'Extra', 'Substitute'].includes(classType);
            const isCancelled = ev.status === 'cancelled' || ev.isCancelled;

            // Hours for this entry
            const hours = classType === 'Lab'
                ? (ev.slotRange ? ev.slotRange.length : 1)
                : 1;

            const sm = slotMeta(ev.slotId);
            const entry = {
                id: ev.id,
                day,
                slotId: ev.slotId,
                slotLabel: sm.label,
                timeStart: sm.start,
                timeEnd: sm.end,
                courseCode: ev.code || '',
                courseName: ev.title || '',
                room: ev.room || '',
                section: ev.section || '',
                year: ev.year || '',
                classType,                          // Theory | Lab | Extra | Substitute | Review | Meeting | Other
                status: isCancelled ? 'Cancelled'
                    : ev.status === 'completed' ? 'Completed'
                    : 'Scheduled',
                hours,
                studentCount: ev.studentCount || 0,
                isTeaching,
            };

            entries.push(entry);
            byDay[day].push(entry);
            byWeek.current.push(entry);

            if (!isTeaching) {
                totalNonTeachingCount++;
                nonTeachingEntries.push(entry);
                return; // don't count non-teaching in hour totals
            }

            if (isCancelled) {
                totalCancelledHours += hours;
            } else if (entry.status === 'Completed') {
                totalCompletedHours += hours;
            } else {
                totalScheduledHours += hours;
            }

            // Accumulate by type (only non-cancelled teaching)
            if (!isCancelled) {
                if (classType === 'Theory') totalTheoryHours += hours;
                else if (classType === 'Lab') totalLabHours += hours;
                else if (classType === 'Extra') totalExtraHours += hours;
                else if (classType === 'Substitute') totalSubstituteHours += hours;
            }

            // Subject grouping
            const subKey = entry.courseName || 'Unknown';
            if (!bySubject[subKey]) {
                bySubject[subKey] = { courseCode: entry.courseCode, theory: 0, lab: 0, extra: 0, substitute: 0, cancelled: 0, total: 0 };
            }
            if (isCancelled) {
                bySubject[subKey].cancelled += hours;
            } else {
                bySubject[subKey][classType.toLowerCase()] = (bySubject[subKey][classType.toLowerCase()] || 0) + hours;
                bySubject[subKey].total += hours;
            }

            // Consecutive tracking
            if (!consecutiveMap[day]) consecutiveMap[day] = [];
            if (typeof ev.slotId === 'number') consecutiveMap[day].push(ev.slotId);
        });
    });

    // Detect consecutive teaching blocks (≥3 slots in a row)
    const consecutiveWarnings = [];
    Object.entries(consecutiveMap).forEach(([day, slots]) => {
        if (slots.length < 3) return;
        const sorted = [...new Set(slots)].sort((a, b) => a - b);
        let streak = 1;
        let streakStart = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                streak++;
            } else {
                if (streak >= 3) consecutiveWarnings.push({ day, from: streakStart, to: sorted[i - 1], count: streak });
                streak = 1;
                streakStart = sorted[i];
            }
        }
        if (streak >= 3) consecutiveWarnings.push({ day, from: streakStart, to: sorted[sorted.length - 1], count: streak });
    });

    // Total active teaching hours (non-cancelled)
    const totalTeachingHours = totalTheoryHours + totalLabHours + totalExtraHours + totalSubstituteHours;

    // Build daily summary
    const dailySummary = {};
    DAYS.forEach(day => {
        const dayEntries = byDay[day].filter(e => e.isTeaching);
        const taught = dayEntries.filter(e => e.status !== 'Cancelled');
        const cancelled = dayEntries.filter(e => e.status === 'Cancelled');
        dailySummary[day] = {
            totalHours: taught.reduce((s, e) => s + e.hours, 0),
            cancelledHours: cancelled.reduce((s, e) => s + e.hours, 0),
            classes: dayEntries.length,
            completedClasses: dayEntries.filter(e => e.status === 'Completed').length,
            scheduledClasses: dayEntries.filter(e => e.status === 'Scheduled').length,
        };
    });

    return {
        facultyId,
        facultyName,
        maxWeeklyHours,

        // Flat list — every row traces to a timetable event
        entries,

        // Grouped views
        byDay,
        bySubject,
        byWeek,
        dailySummary,

        // Summaries
        totalTeachingHours,
        totalTheoryHours,
        totalLabHours,
        totalExtraHours,
        totalSubstituteHours,
        totalCancelledHours,
        totalScheduledHours,
        totalCompletedHours,
        totalCourses: Object.keys(bySubject).length,

        // Non-teaching
        nonTeachingEntries,
        totalNonTeachingCount,

        // Warnings
        consecutiveWarnings,
    };
}

// ────────────────────── classify event type ──────────────────────

function resolveClassType(ev) {
    if (ev.isSubstitute || ev.classType === 'Substitute') return 'Substitute';
    if (ev.isExtra || ev.classType === 'Extra') return 'Extra';
    const t = (ev.type || '').toLowerCase();
    if (t === 'lab') return 'Lab';
    if (t === 'theory') return 'Theory';
    if (t === 'review' || t === 'meeting' || t === 'placement') return ev.type; // non-teaching
    return 'Theory'; // default
}

// ────────────────────── empty report shell ──────────────────────

function emptyReport(facultyId, facultyName, maxWeeklyHours) {
    const byDay = {};
    DAYS.forEach(d => { byDay[d] = []; });
    return {
        facultyId,
        facultyName: facultyName || '',
        maxWeeklyHours: maxWeeklyHours || 20,
        entries: [],
        byDay,
        bySubject: {},
        byWeek: { current: [] },
        dailySummary: {},
        totalTeachingHours: 0,
        totalTheoryHours: 0,
        totalLabHours: 0,
        totalExtraHours: 0,
        totalSubstituteHours: 0,
        totalCancelledHours: 0,
        totalScheduledHours: 0,
        totalCompletedHours: 0,
        totalCourses: 0,
        nonTeachingEntries: [],
        totalNonTeachingCount: 0,
        consecutiveWarnings: [],
    };
}
