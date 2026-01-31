export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const SECTIONS = ["A", "B", "C", "D"];

export const SLOTS = [
  { id: 1, start: "08:00", end: "08:50", label: "Slot 1" },
  { id: 2, start: "08:50", end: "09:40", label: "Slot 2" },
  { id: 3, start: "09:40", end: "10:30", label: "Slot 3" },
  { id: 'break1', start: "10:30", end: "10:45", label: "Interval", isBreak: true },
  { id: 4, start: "10:45", end: "11:35", label: "Slot 4" },
  { id: 5, start: "11:35", end: "12:25", label: "Slot 5" },
  { id: 6, start: "12:25", end: "13:15", label: "Slot 6" },
  { id: 'lunch', start: "13:15", end: "14:05", label: "Lunch Break", isBreak: true },
  { id: 8, start: "14:05", end: "14:55", label: "Slot 8" },
  { id: 9, start: "14:55", end: "15:45", label: "Slot 9" },
  { id: 10, start: "15:45", end: "16:35", label: "Slot 10" },
  { id: 11, start: "16:35", end: "17:25", label: "Slot 11" },
  { id: 12, start: "17:25", end: "18:15", label: "Slot 12" },
];

export const TEACHER_COURSES = [
  { id: "23CSE312", title: "Compilers", years: ["3rd Year"] },
  { id: "23CSE311", title: "Database Systems", years: ["2nd Year", "3rd Year"] },
  { id: "23CSE313", title: "Artificial Intelligence", years: ["4th Year"] },
  { id: "23CSE314", title: "Operating Systems", years: ["2nd Year"] },
  { id: "MENTOR", title: "Mentoring", years: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
  { id: "PRJ-REV", title: "Project Review", years: ["4th Year"] }
];

export const INITIAL_EVENTS = {
  "Monday": [
    { 
      slotId: 2, 
      code: "23CSE312", 
      title: "Compilers", 
      room: "A-205", 
      type: "Theory", 
      year: "3rd Year", 
      section: "A",
      studentCount: 42
    },
    { 
      slotId: 4, 
      code: "23CSE312", 
      title: "Compiler Lab", 
      room: "SF PG Lab", 
      type: "Lab", 
      year: "3rd Year", 
      section: "A",
      studentCount: 28
    },
    { 
      slotId: 5, 
      code: "23CSE312", 
      title: "Compiler Lab", 
      room: "SF PG Lab", 
      type: "Lab", 
      year: "3rd Year", 
      section: "A",
      studentCount: 28
    },
    { 
      slotId: 9, 
      code: "23CSE311", 
      title: "Database Systems", 
      room: "B-102", 
      type: "Theory", 
      year: "2nd Year", 
      section: "C",
      studentCount: 56
    }
  ],
  "Tuesday": [
    { 
      slotId: 1, 
      code: "PRJ-REV", 
      title: "B.Tech Project Rev", 
      room: "Main Hall", 
      type: "Review", 
      year: "4th Year", 
      section: "B",
      studentCount: 15
    },
    { 
      slotId: 10, 
      code: "23CSE311", 
      title: "DB Systems Eval", 
      room: "A-205", 
      type: "Theory", 
      year: "3rd Year", 
      section: "A",
      studentCount: 35
    }
  ],
  "Wednesday": [
    { 
      slotId: 2, 
      code: "23CSE313", 
      title: "Artificial Intelligence", 
      room: "B-202", 
      type: "Theory", 
      year: "4th Year", 
      section: "A",
      studentCount: 22
    },
    { 
      slotId: 4, 
      code: "23CSE314", 
      title: "OS Lab", 
      room: "CP Lab 2", 
      type: "Lab", 
      year: "2nd Year", 
      section: "D",
      studentCount: 30
    }
  ],
  "Thursday": [],
  "Friday": [],
  "Saturday": [
    { 
      slotId: 2, 
      code: "23CSE313", 
      title: "Artificial Intelligence", 
      room: "B-202", 
      type: "Theory", 
      year: "4th Year", 
      section: "A",
      studentCount: 25
    },
    { 
      slotId: 4, 
      code: "23CSE314", 
      title: "OS Lab", 
      room: "CP Lab 2", 
      type: "Lab", 
      year: "2nd Year", 
      section: "D",
      studentCount: 32
    },
    { 
      slotId: 5, 
      code: "23CSE314", 
      title: "OS Lab", 
      room: "CP Lab 2", 
      type: "Lab", 
      year: "2nd Year", 
      section: "D",
      studentCount: 32
    }
  ]
};

export const COLORS = {
  Theory: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Lab: 'bg-orange-50 text-orange-700 border-orange-100',
  Review: 'bg-purple-50 text-purple-700 border-purple-100',
  Meeting: 'bg-amber-50 text-amber-800 border-amber-100',
  Placement: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rose: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
};