export const announcements = [
  {
    id: 1,
    type: "urgent",
    title: "Campus Closure Notice",
    content:
      "Due to heavy rainfall, the campus will remain closed tomorrow (March 15, 2024). All classes are cancelled. Online sessions will be conducted as per the regular timetable.",
    date: "2024-03-14",
    time: "14:30",
    priority: "high",
    author: "Administration",
    contentType: "text",
  },
  {
    id: 2,
    type: "academic",
    title: "Mid-Semester Examination Schedule Released",
    content:
      "The mid-semester examination schedule for Semester 6 has been released. Please check the timetable section for detailed information. Last date for re-evaluation applications is March 20, 2024.",
    date: "2024-03-12",
    time: "10:15",
    priority: "medium",
    author: "Academic Office",
    contentType: "text",
  },
  {
    id: 3,
    type: "student",
    title: "Freshers Party 2024 - Registration Open!",
    content:
      "Join us for the most awaited Freshers Party 2024! Experience amazing performances, games, and make unforgettable memories with your batchmates.",
    date: "2024-03-10",
    time: "16:45",
    priority: "medium",
    author: "Student Council",
    contentType: "image",
    asset: "/src/assets/sample_image.jpeg",
  },
  {
    id: 4,
    type: "general",
    title: "Library Hours Extended",
    content:
      "The central library will remain open until 10:00 PM on weekdays starting from next week. This is to accommodate the increased study hours during examination period.",
    date: "2024-03-08",
    time: "09:20",
    priority: "low",
    author: "Library Management",
    contentType: "text",
  },
  {
    id: 5,
    type: "academic",
    title: "Research Paper Publication Guidelines",
    content:
      "Complete guidelines for publishing research papers in reputed journals. Includes formatting requirements, submission procedures, and important deadlines.",
    date: "2024-03-05",
    time: "11:30",
    priority: "medium",
    author: "Research Department",
    contentType: "pdf",
    asset: "/src/assets/smaple_pdf.pdf",
  },
  {
    id: 6,
    type: "urgent",
    title: "Internet Connectivity Issues",
    content:
      "Campus internet services will be temporarily unavailable from 2:00 AM to 4:00 AM tomorrow for maintenance. Please plan your online activities accordingly.",
    date: "2024-03-13",
    time: "18:00",
    priority: "high",
    author: "IT Services",
    contentType: "text",
  },
  {
    id: 7,
    type: "student",
    title: "Cultural Fest 2024 - Call for Performers",
    content:
      "Amrita Cultural Fest 2024 is looking for talented performers! Whether you sing, dance, act, or have any special talent, this is your chance to shine.",
    date: "2024-03-07",
    time: "13:15",
    priority: "medium",
    author: "Cultural Committee",
    contentType: "link",
    link: "https://amrita.edu/cultural-fest-2024",
  },
  {
    id: 8,
    type: "academic",
    title: "New Course: Advanced Machine Learning",
    content:
      "Exciting news! We are introducing a new elective course on Advanced Machine Learning starting next semester. Course syllabus and registration details attached.",
    date: "2024-03-06",
    time: "09:45",
    priority: "medium",
    author: "CSE Department",
    contentType: "pdf",
    asset: "/src/assets/smaple_pdf.pdf",
  },
  {
    id: 9,
    type: "student",
    title: "Sports Tournament Registration",
    content:
      "Intra-college sports tournament registrations are now open! Participate in Football, Basketball, Volleyball, and Table Tennis. Team registrations close on March 25.",
    date: "2024-03-04",
    time: "15:20",
    priority: "low",
    author: "Sports Committee",
    contentType: "image",
    asset: "/src/assets/sample_image.jpeg",
  },
  {
    id: 10,
    type: "general",
    title: "Campus WiFi Upgrade Completed",
    content:
      "We are pleased to announce that the campus WiFi upgrade has been completed successfully. You should now experience faster and more reliable internet connectivity across all campus areas.",
    date: "2024-03-02",
    time: "12:00",
    priority: "low",
    author: "IT Services",
    contentType: "text",
  },
];

// Filter configurations
export const filterTypes = [
  { type: 'all', label: 'All', activeColor: 'bg-[#8B0000] text-white', inactiveColor: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  { type: 'urgent', label: 'Urgent', activeColor: 'bg-red-500 text-white', inactiveColor: 'bg-red-50 text-red-600 hover:bg-red-100' },
  { type: 'academic', label: 'Academic', activeColor: 'bg-blue-500 text-white', inactiveColor: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { type: 'student', label: 'Student', activeColor: 'bg-purple-500 text-white', inactiveColor: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { type: 'general', label: 'General', activeColor: 'bg-green-500 text-white', inactiveColor: 'bg-green-50 text-green-600 hover:bg-green-100' }
];

// Type icon mapping - returns icon type string
export const getTypeIconName = (type) => {
  const iconMap = {
    urgent: 'AlertTriangle',
    academic: 'BookOpen',
    student: 'Users',
    general: 'Megaphone'
  };
  return iconMap[type] || 'Megaphone';
};

// Type color mapping
export const getTypeColor = (type) => {
  const colorMap = {
    urgent: 'bg-red-50 border-red-200 text-red-700',
    academic: 'bg-blue-50 border-blue-200 text-blue-700',
    student: 'bg-purple-50 border-purple-200 text-purple-700',
    general: 'bg-green-50 border-green-200 text-green-700'
  };
  return colorMap[type] || 'bg-gray-50 border-gray-200 text-gray-700';
};

// Content type icon mapping - returns icon type string
export const getContentTypeIconName = (contentType) => {
  const iconMap = {
    image: 'Image',
    pdf: 'FileText',
    link: 'Link'
  };
  return iconMap[contentType] || null;
};

// Priority color mapping
export const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800';
};

// Stats configuration
export const statsConfig = [
  { type: 'urgent', label: 'Urgent Notices', color: 'text-[#8B0000]' },
  { type: 'academic', label: 'Academic Updates', color: 'text-blue-600' },
  { type: 'student', label: 'Student Events', color: 'text-purple-600' },
  { type: 'general', label: 'General Info', color: 'text-green-600' }
];

// Date formatting utility
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
