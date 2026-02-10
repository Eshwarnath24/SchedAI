// Mock updates data
// In a real app, this would come from a database or API

export const SCHEDULE_UPDATES = [
    {
      id: 1,
      section: 'CSE A', 
      day: 'MONDAY',
      slotId: '1',
      type: 'CANCELLED',
      originalCourseCode: '23CSE312',
      reason: 'Faculty Leave'
    },
    {
      id: 2,
      section: 'CSE A',
      day: 'TUESDAY', // Today
      slotId: '8', 
      type: 'EXTRA',
      course: { code: '23CSE314', name: 'Networks', room: 'A-201', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      reason: 'Syllabus completion'
    },
    {
        id: 3,
        section: 'CSE A',
        day: 'WEDNESDAY',
        slotId: '3',
        type: 'RESCHEDULED',
        originalCourseCode: '23CSE313',
        newCourse: { code: '23MAT301', name: 'Lin. Algebra', room: 'C-105', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        reason: 'Swapped with Math'
    },
    {
        id: 'u4',
        section: 'CSE B',
        day: 'THURSDAY',
        slotId: '4',
        type: 'CANCELLED',
        reason: 'Technical Issue'
    }
];
  
export const getUpdatesForSection = (section) => {
    return SCHEDULE_UPDATES.filter(u => u.section === section);
};

export const getEffectedSchedule = (baseSchedule, updates) => {
    if (!updates || updates.length === 0) return baseSchedule;

    // Deep copy to avoid mutating base schedule
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
             // Replaces whatever was there
             newSchedule[update.day][update.slotId] = {
                ...update.newCourse,
                status: 'RESCHEDULED',
                reason: update.reason
             };
        }
    });

    return newSchedule;
};
