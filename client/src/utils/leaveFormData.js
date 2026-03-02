// ─── Leave Form Static Data ───────────────────────────────────────────────────

export const initialFacultyData = [
  {
    id: 'F-101',
    name: 'Dr. Rajesh Khanna',
    dept: 'Computer Science',
    type: 'Casual Leave',
    from: '25-Apr-2024',
    to: '27-Apr-2024',
    duration: '3 Days',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    substitute: 'Prof. Naveen',
  },
  {
    id: 'F-102',
    name: 'Prof. Amit Sharma',
    dept: 'Mechanical',
    type: 'Earned Leave',
    from: '20-Apr-2024',
    to: '25-Apr-2024',
    duration: '6 Days',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    substitute: 'Dr. Sandeep',
  },
  {
    id: 'F-103',
    name: 'Dr. Priya Verma',
    dept: 'Electronics',
    type: 'Sick Leave',
    from: '22-Apr-2024',
    to: '22-Apr-2024',
    duration: '1 Day',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80',
    substitute: 'Prof. Megha',
  },
  {
    id: 'F-104',
    name: 'Prof. Suresh Iyer',
    dept: 'Civil',
    type: 'Maternity Leave',
    from: '01-May-2024',
    to: '30-Jul-2024',
    duration: '90 Days',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
    substitute: 'Dr. Aruna',
  },
  {
    id: 'F-105',
    name: 'Dr. Ananya Reddy',
    dept: 'Chemistry',
    type: 'Medical Leave',
    from: '18-Apr-2024',
    to: '20-Apr-2024',
    duration: '3 Days',
    status: 'Rejected',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80',
    substitute: 'Prof. Karthik',
  },
  {
    id: 'F-106',
    name: 'Prof. Vikram Singh',
    dept: 'Mathematics',
    type: 'Earned Leave',
    from: '15-May-2024',
    to: '20-May-2024',
    duration: '6 Days',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&q=80',
    substitute: 'Dr. Kavita',
  },
];

export const pendingRequests = [
  { dept: 'Computer Science', count: 8 },
];

export const trendChartData = [
  { name: 'Mon', 'Leaves Taken': 12, Approvals: 7 },
  { name: 'Tue', 'Leaves Taken': 19, Approvals: 11 },
  { name: 'Wed', 'Leaves Taken': 3,  Approvals: 5 },
  { name: 'Thu', 'Leaves Taken': 5,  Approvals: 8 },
  { name: 'Fri', 'Leaves Taken': 2,  Approvals: 3 },
  { name: 'Sat', 'Leaves Taken': 3,  Approvals: 7 },
];

export const typeChartData = [
  { name: 'Earned',  value: 40 },
  { name: 'Casual',  value: 30 },
  { name: 'Sick',    value: 20 },
  { name: 'Others',  value: 10 },
];

/** Pie-chart colours aligned with the four leave types above */
export const CHART_COLORS = ['#2196f3', '#ffc107', '#d32f2f', '#757575'];
