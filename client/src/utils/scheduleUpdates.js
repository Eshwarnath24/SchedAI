import { fetchScheduleOverrides } from './api';

// Fetch schedule updates (overrides) from backend
export const getUpdatesForSection = async (sectionId) => {
    if (!sectionId) return [];
    try {
        const data = await fetchScheduleOverrides(sectionId);
        return (data.overrides || []).map(ov => ({
            id: ov._id,
            section: ov.section,
            day: ov.day.toUpperCase(),
            slotId: String(ov.slotIndex),
            type: ov.type,
            originalCourseCode: ov.courseCode,
            courseCode: ov.courseCode,
            reason: ov.reason,
            // For RESCHEDULED entries
            ...(ov.type === 'RESCHEDULED' ? {
                newCourse: {
                    code: ov.courseCode,
                    name: ov.courseName,
                    room: ov.newRoom || 'TBA',
                    color: 'bg-purple-50 text-purple-700 border-purple-200',
                },
            } : {}),
            // For CANCELLED entries
            ...(ov.type === 'CANCELLED' ? {
                course: {
                    code: ov.courseCode,
                    name: ov.courseName,
                },
            } : {}),
        }));
    } catch (err) {
        console.warn('⚠️ Could not fetch schedule updates:', err.message);
        return [];
    }
};

// Apply overrides to a base schedule grid (used if needed client-side)
export const getEffectedSchedule = (baseSchedule, updates) => {
    if (!updates || updates.length === 0) return baseSchedule;

    const newSchedule = JSON.parse(JSON.stringify(baseSchedule));

    updates.forEach(update => {
        if (!newSchedule[update.day]) {
            newSchedule[update.day] = {};
        }

        if (update.type === 'CANCELLED') {
            const existing = newSchedule[update.day][update.slotId];
            if (existing) {
                newSchedule[update.day][update.slotId] = {
                    ...existing,
                    status: 'CANCELLED',
                    reason: update.reason
                };
            }
        } else if (update.type === 'EXTRA') {
            newSchedule[update.day][update.slotId] = {
                ...update.course,
                status: 'EXTRA',
                reason: update.reason
            };
        } else if (update.type === 'RESCHEDULED') {
            newSchedule[update.day][update.slotId] = {
                ...update.newCourse,
                status: 'RESCHEDULED',
                reason: update.reason
            };
        }
    });

    return newSchedule;
};
