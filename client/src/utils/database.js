// ==================== BRANCH & SECTION DATA ====================
export const BRANCHES = [
  {
    id: "CSE",
    name: "Computer Science and Engineering",
    department: "CSE",
    sections: [
      { id: "A", name: "Section A", studentCount: 60 },
      { id: "B", name: "Section B", studentCount: 58 },
      { id: "C", name: "Section C", studentCount: 62 },
      { id: "D", name: "Section D", studentCount: 55 }
    ]
  },
  {
    id: "ECE",
    name: "Electronics and Communication Engineering",
    department: "ECE",
    sections: [
      { id: "A", name: "Section A", studentCount: 55 },
      { id: "B", name: "Section B", studentCount: 52 },
      { id: "C", name: "Section C", studentCount: 58 }
    ]
  },
  {
    id: "ME",
    name: "Mechanical Engineering",
    department: "ME",
    sections: [
      { id: "A", name: "Section A", studentCount: 50 },
      { id: "B", name: "Section B", studentCount: 48 }
    ]
  },
  {
    id: "EEE",
    name: "Electrical and Electronics Engineering",
    department: "EEE",
    sections: [
      { id: "A", name: "Section A", studentCount: 45 },
      { id: "B", name: "Section B", studentCount: 47 }
    ]
  }
];

// ==================== COURSES DATA ====================
export const COURSES = [
  {
    id: "23CSE312",
    code: "23CSE312",
    title: "Compilers",
    department: "CSE",
    year: "3rd Year",
    credits: 3,
    type: "Theory",
    labHours: 2
  },
  {
    id: "23CSE311",
    code: "23CSE311",
    title: "Database Systems",
    department: "CSE",
    year: "2nd Year",
    credits: 4,
    type: "Theory",
    labHours: 3
  },
  {
    id: "23CSE313",
    code: "23CSE313",
    title: "Artificial Intelligence",
    department: "CSE",
    year: "4th Year",
    credits: 3,
    type: "Theory",
    labHours: 0
  },
  {
    id: "23CSE314",
    code: "23CSE314",
    title: "Operating Systems",
    department: "CSE",
    year: "2nd Year",
    credits: 4,
    type: "Theory",
    labHours: 2
  },
  {
    id: "PRJ-REV",
    code: "PRJ-REV",
    title: "Project Review",
    department: "CSE",
    year: "4th Year",
    credits: 0,
    type: "Review",
    labHours: 0
  },
  {
    id: "MENTOR",
    code: "MENTOR",
    title: "Mentoring",
    department: "CSE",
    year: "All",
    credits: 0,
    type: "Mentoring",
    labHours: 0
  }
];

// ==================== TEACHERS DATA ====================
export const TEACHERS = [
  {
    id: "T001",
    name: "Dr. Robert Johnson",
    designation: "Associate Professor",
    department: "CSE",
    email: "robert.johnson@amrita.edu",
    phone: "+91 98765 43210",
    officeRoom: "B-402",
    campus: "Ettimadai Main",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    courses: [
      {
        courseId: "23CSE312",
        courseCode: "23CSE312",
        courseTitle: "Compilers",
        sections: [
          { year: "3rd Year", section: "A", studentCount: 42 }
        ]
      },
      {
        courseId: "23CSE311",
        courseCode: "23CSE311",
        courseTitle: "Database Systems",
        sections: [
          { year: "2nd Year", section: "C", studentCount: 56 },
          { year: "3rd Year", section: "A", studentCount: 35 }
        ]
      },
      {
        courseId: "23CSE313",
        courseCode: "23CSE313",
        courseTitle: "Artificial Intelligence",
        sections: [
          { year: "4th Year", section: "A", studentCount: 25 }
        ]
      },
      {
        courseId: "23CSE314",
        courseCode: "23CSE314",
        courseTitle: "Operating Systems",
        sections: [
          { year: "2nd Year", section: "D", studentCount: 32 }
        ]
      }
    ],
    totalStudents: 142,
    totalCourses: 4
  },
  {
    id: "T002",
    name: "Dr. Sarah Williams",
    designation: "Professor",
    department: "CSE",
    email: "sarah.williams@amrita.edu",
    phone: "+91 98765 43211",
    officeRoom: "B-403",
    campus: "Ettimadai Main",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    courses: [
      {
        courseId: "23CSE311",
        courseCode: "23CSE311",
        courseTitle: "Database Systems",
        sections: [
          { year: "2nd Year", section: "A", studentCount: 60 }
        ]
      }
    ],
    totalStudents: 60,
    totalCourses: 1
  },
  {
    id: "T003",
    name: "Prof. Michael Chen",
    designation: "Assistant Professor",
    department: "CSE",
    email: "michael.chen@amrita.edu",
    phone: "+91 98765 43212",
    officeRoom: "B-404",
    campus: "Ettimadai Main",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    courses: [
      {
        courseId: "23CSE313",
        courseCode: "23CSE313",
        courseTitle: "Artificial Intelligence",
        sections: [
          { year: "4th Year", section: "B", studentCount: 28 }
        ]
      }
    ],
    totalStudents: 28,
    totalCourses: 1
  }
];

// ==================== CURRENT USER ====================
export const CURRENT_TEACHER = TEACHERS[0]; // Dr. Robert Johnson

// ==================== HELPER FUNCTIONS ====================

// Get teacher by ID
export const getTeacherById = (teacherId) => {
  return TEACHERS.find(t => t.id === teacherId);
};

// Get course by ID
export const getCourseById = (courseId) => {
  return COURSES.find(c => c.id === courseId);
};

// Get branch by ID
export const getBranchById = (branchId) => {
  return BRANCHES.find(b => b.id === branchId);
};

// Get total students for a teacher
export const getTotalStudentsForTeacher = (teacherId) => {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return 0;
  
  return teacher.courses.reduce((total, course) => {
    const courseTotal = course.sections.reduce((sum, section) => sum + section.studentCount, 0);
    return total + courseTotal;
  }, 0);
};

// Get section details
export const getSectionDetails = (branchId, sectionId) => {
  const branch = getBranchById(branchId);
  if (!branch) return null;
  
  return branch.sections.find(s => s.id === sectionId);
};

// Get all students count by department
export const getTotalStudentsByDepartment = (departmentId) => {
  const branch = getBranchById(departmentId);
  if (!branch) return 0;
  
  return branch.sections.reduce((total, section) => total + section.studentCount, 0);
};
