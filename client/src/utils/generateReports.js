/**
 * Generates comprehensive teacher workload reports
 * Calculates hours across different class types, substitutions, and leaves
 */

export function generateTeacherWorkloadReport(rawData) {
    const {
        teachers = [],
        timetable = [],
        leaves = [],
        cancelledClasses = [],
        extraClasses = [],
        substitutions = []
    } = rawData || {};

    const cancelledClassIds = new Set(cancelledClasses.map((item) => item.classId));
    const leaveDatesByFaculty = new Map();
    
    for (const leave of leaves) {
        if (!leaveDatesByFaculty.has(leave.facultyId)) 
            leaveDatesByFaculty.set(leave.facultyId, new Set());
        leaveDatesByFaculty.get(leave.facultyId).add(leave.date);
    }

    const substitutionByClassAndDate = new Map();
    for (const sub of substitutions) {
        substitutionByClassAndDate.set(`${sub.classId}|${sub.date}`, sub.substituteFaculty);
    }

    const reportByFaculty = new Map();
    for (const teacher of teachers) {
        reportByFaculty.set(teacher.facultyId, {
            facultyId: teacher.facultyId,
            name: teacher.name,
            maxWeeklyHours: teacher.maxWeeklyHours,
            theoryHours: 0,
            labHours: 0,
            extraClassHours: 0,
            totalHours: 0,
            status: "Within Limit",
            subjects: {}
        });
    }

    const addHours = (facultyId, type, hours, courseName) => {
        if (!reportByFaculty.has(facultyId)) return;
        const report = reportByFaculty.get(facultyId);
        
        if (type === "Theory") report.theoryHours += hours;
        else if (type === "Lab") report.labHours += hours;
        else if (type === "Extra") report.extraClassHours += hours;

        if (courseName) {
            if (!report.subjects[courseName]) 
                report.subjects[courseName] = { hours: 0, type };
            report.subjects[courseName].hours += hours;
        }
    };

    // Process timetable entries
    for (const entry of timetable) {
        if (cancelledClassIds.has(entry.classId)) continue;
        
        const hours = entry.type === "Lab" ? (entry.slotRange ? entry.slotRange.length : 3) : 1;
        const leaveDates = leaveDatesByFaculty.get(entry.facultyId);
        
        if (leaveDates && leaveDates.has(entry.date)) {
            const substitute = substitutionByClassAndDate.get(`${entry.classId}|${entry.date}`);
            if (substitute) addHours(substitute, entry.type, hours, entry.course);
            continue;
        }
        addHours(entry.facultyId, entry.type, hours, entry.course);
    }

    // Process extra classes
    for (const extra of extraClasses) 
        addHours(extra.facultyId, "Extra", 1, extra.course);

    // Finalize reports
    for (const report of reportByFaculty.values()) {
        report.totalHours = report.theoryHours + report.labHours + report.extraClassHours;
        report.status = report.totalHours > report.maxWeeklyHours ? "Overloaded" : "Within Limit";
    }

    return Array.from(reportByFaculty.values());
}

/**
 * Calculate report metrics for display
 */
export function calculateReportMetrics(currentDate, activeReport) {
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const shortMonth = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    
    return {
        day, 
        month, 
        shortMonth, 
        year,
        syllabus: activeReport ? Math.min(15 + (day * 2.5), 100) : 0,
        attendance: 88.4,
        feedback: "4.8",
        weeklyLoad: activeReport?.totalHours || 0
    };
}

/**
 * Generate timeline for academic engagement chart
 */
export function generateChartTimeline(currentDate) {
    const dates = [];
    let checkDate = new Date(currentDate);
    
    // Project forward 2 working days (skipping Sundays)
    let added = 0;
    while (added < 2) {
        checkDate.setDate(checkDate.getDate() + 1);
        if (checkDate.getDay() !== 0) added++; 
    }
    const endDate = new Date(checkDate);

    // Build 7-day window backward from that endDate (skipping Sundays)
    let count = 0;
    let tempDate = new Date(endDate);
    while (count < 7) {
        if (tempDate.getDay() !== 0) { 
            dates.unshift({
                day: tempDate.getDate(),
                isToday: tempDate.toDateString() === currentDate.toDateString(),
                label: `${tempDate.toLocaleString('default', { month: 'short' })} ${tempDate.getDate()}`
            });
            count++;
        }
        tempDate.setDate(tempDate.getDate() - 1);
    }
    return dates;
}

/**
 * Calculate X coordinate for today marker on chart
 */
export function getTodayXCoordinate(chartTimeline, chartWidth = 700) {
    const index = chartTimeline.findIndex(item => item.isToday);
    if (index === -1) return chartWidth / 2;
    return (index / (chartTimeline.length - 1)) * chartWidth;
}
