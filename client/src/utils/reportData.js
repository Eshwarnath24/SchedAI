// Consolidated Data Layer for Teacher Workload Reports
export const reportData = {
    teachers: [
        { facultyId: "FAC-12", name: "Dr. Omer Erdogan", maxWeeklyHours: 20, dept: "CSE" },
        { facultyId: "FAC-05", name: "Prof. Sarah Jenkins", maxWeeklyHours: 18, dept: "CSE" }
    ],
    timetable: [
        { classId: "C1", facultyId: "FAC-12", course: "Data Structures", type: "Theory", date: "2026-02-05", section: "A" },
        { classId: "C2", facultyId: "FAC-12", course: "Algorithms Lab", type: "Lab", date: "2026-02-05", slotRange: [1, 2, 3], section: "B" },
        { classId: "C3", facultyId: "FAC-12", course: "Data Structures", type: "Theory", date: "2026-02-04", section: "A" },
        { classId: "C4", facultyId: "FAC-05", course: "Software Engineering", type: "Theory", date: "2026-02-05", section: "C" }
    ],
    leaves: [
        { facultyId: "FAC-05", date: "2026-02-05", reason: "Medical" }
    ],
    cancelledClasses: [],
    extraClasses: [
        { facultyId: "FAC-12", course: "Special Seminar", date: "2026-07" }
    ],
    substitutions: [
        { classId: "C4", date: "2026-02-05", substituteFaculty: "FAC-12" } 
    ]
};
