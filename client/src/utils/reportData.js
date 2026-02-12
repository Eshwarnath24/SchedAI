import { CURRENT_TEACHER } from './database';
import { DAYS, SLOTS } from './constants';
/**
 * Report Data Adapter
 * ───────────────────
 * Bridges AppContext data → buildFacultyActivityReport().
 * Strictly scoped to the logged-in faculty; no global aggregation.
 */

import { CURRENT_TEACHER } from './database';

/**
 * Produce the params object that buildFacultyActivityReport expects,
 * using the logged-in teacher and the live events map.
 *
 * @param {Object} events          – timetable events from AppContext  { Monday:[…], … }
 * @param {Object} teacher         – currentTeacher from AppContext (or CURRENT_TEACHER fallback)
 * @returns {{ facultyId, facultyName, events, assignedCourses, maxWeeklyHours }}
 */
export function prepareFacultyReportInput(events, teacher = CURRENT_TEACHER) {
    if (!teacher || !events) {
        return {
            facultyId: teacher?.id || '',
            facultyName: teacher?.name || '',
            events: {},
            assignedCourses: [],
            maxWeeklyHours: 20,
        };
    }

    return {
        facultyId: teacher.id,
        facultyName: teacher.name,
        events,                                       // pass through unchanged
        assignedCourses: teacher.courses || [],        // from database.js
        maxWeeklyHours: 20,                            // institutional constant
    };
}

// ── Backward-compat default export (unused, kept to avoid import errors) ──
export const reportData = {
    teachers: [],
    timetable: [],
    leaves: [],
    cancelledClasses: [],
    extraClasses: [],
    substitutions: [],
};


 /** Report Data Adapter
 * ───────────────────
 * Bridges AppContext data → buildFacultyActivityReport().
 * Strictly scoped to the logged-in faculty; no global aggregation.
 */

import { CURRENT_TEACHER } from './database';

/**
 * Produce the params object that buildFacultyActivityReport expects,
 * using the logged-in teacher and the live events map.
 *
 * @param {Object} events          – timetable events from AppContext  { Monday:[…], … }
 * @param {Object} teacher         – currentTeacher from AppContext (or CURRENT_TEACHER fallback)
 * @returns {{ facultyId, facultyName, events, assignedCourses, maxWeeklyHours }}
 */
export function prepareFacultyReportInput(events, teacher = CURRENT_TEACHER) {
    if (!teacher || !events) {
        return {
            facultyId: teacher?.id || '',
            facultyName: teacher?.name || '',
            events: {},
            assignedCourses: [],
            maxWeeklyHours: 20,
        };
    }

    return {
        facultyId: teacher.id,
        facultyName: teacher.name,
        events,                                       // pass through unchanged
        assignedCourses: teacher.courses || [],        // from database.js
        maxWeeklyHours: 20,                            // institutional constant
    };
}

// ── Backward-compat default export (unused, kept to avoid import errors) ──
export const reportData = {
    teachers: [],
    timetable: [],
    leaves: [],
    cancelledClasses: [],
    extraClasses: [],
    substitutions: [],
};


/**
 * Generate dynamic report data from current teacher and timetable
 * @param {Object} events - Timetable events from AppContext
 * @param {Object} teacher - Current teacher object from database
 * @returns {Object} - Report data in the format expected by generateTeacherWorkloadReport
 */
export function generateDynamicReportData(events, teacher = CURRENT_TEACHER) {
    if (!teacher || !events) {
        console.log('⚠️ No teacher or events data available');
        return getDefaultReportData();
    }

    // Get all classes for the current teacher from the week
    const timetableEntries = [];
    let classIdCounter = 1;

    DAYS.forEach(day => {
        const dayEvents = events[day] || [];
        dayEvents.forEach(event => {
            // Only include completed classes for report generation
            // Reports show actual teaching done, not planned workload
            if (event.status === 'completed') {
                // Calculate slot duration for labs
                let slotRange = [event.slotId];
                if (event.type === 'Lab' && typeof event.slotId === 'number') {
                    // Labs typically span 2-3 consecutive slots
                    // Find the next non-break slot
                    const currentSlotIndex = SLOTS.findIndex(s => s.id === event.slotId);
                    if (currentSlotIndex !== -1 && currentSlotIndex < SLOTS.length - 1) {
                        const nextSlot = SLOTS[currentSlotIndex + 1];
                        // Only add if next slot is not a break
                        if (!nextSlot.isBreak && typeof nextSlot.id === 'number') {
                            slotRange.push(nextSlot.id);
                        }
                    }
                }

                timetableEntries.push({
                    classId: `C${classIdCounter++}`,
                    facultyId: teacher.id,
                    course: event.title,
                    type: event.type || 'Theory',
                    date: formatDateForReport(day),
                    slotRange: event.type === 'Lab' ? slotRange : undefined,
                    section: event.section || 'A',
                    studentCount: event.studentCount || 0
                });
            }
        });
    });

    console.log(`📊 Generated ${timetableEntries.length} timetable entries for ${teacher.name}`);
    console.log('Teacher ID:', teacher.id);
    console.log('Sample entries:', timetableEntries.slice(0, 2));

    return {
        teachers: [
            {
                facultyId: teacher.id,
                name: teacher.name,
                maxWeeklyHours: 20, // Standard weekly limit
                dept: teacher.department
            }
        ],
        timetable: timetableEntries,
        leaves: [],
        cancelledClasses: [],
        extraClasses: [],
        substitutions: []
    };
}

/**
 * Format day name to date string for report
 */
function formatDateForReport(dayName) {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMap = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
    };
    
    const targetDayIndex = dayMap[dayName];
    const daysOffset = targetDayIndex - currentDayIndex;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysOffset);
    
    return targetDate.toISOString().split('T')[0];
}

/**
 * Get default report data if dynamic generation fails
 */
function getDefaultReportData() {
    return {
        teachers: [
            { 
                facultyId: "FAC-12", 
                name: "Dr. Robert Johnson", 
                maxWeeklyHours: 20, 
                dept: "CSE" 
            }
        ],
        timetable: [],
        leaves: [],
        cancelledClasses: [],
        extraClasses: [],
        substitutions: []
    };
}

// Export for backward compatibility
export const reportData = getDefaultReportData();

