export const SECTIONS = ['CSE A', 'CSE B', 'CSE C', 'CSE D', 'CSE E', 'CSE F'];

export const TEACHERS = [
  { name: 'Dr. Robert Fox', isTeacherAvalible: true },
  { name: 'Dr. S. Kumar', isTeacherAvalible: false },
  { name: 'Prof. Anjali Menon', isTeacherAvalible: true },
  { name: 'Dr. Lakshmi Thomas', isTeacherAvalible: true },
  { name: 'Prof. Rahul Verma', isTeacherAvalible: false },
  { name: 'Dr. P. Jayakumar', isTeacherAvalible: true },
];

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const TIME_SLOTS = [
  { id: '1', start: '08:00', end: '08:50', label: 'SLOT 1' },
  { id: '2', start: '08:50', end: '09:40', label: 'SLOT 2' },
  { id: '3', start: '09:40', end: '10:30', label: 'SLOT 3' },
  { id: 'break1', start: '10:30', end: '10:50', label: 'INTERVAL', isBreak: true },
  { id: '4', start: '10:50', end: '11:40', label: 'SLOT 4' },
  { id: '5', start: '11:40', end: '12:30', label: 'SLOT 5' },
  { id: 'break2', start: '12:30', end: '13:30', label: 'LUNCH', isBreak: true },
  { id: '6', start: '13:30', end: '14:20', label: 'SLOT 6' },
  { id: '7', start: '14:20', end: '15:10', label: 'SLOT 7' },
  { id: '8', start: '15:10', end: '16:00', label: 'SLOT 8' },
  { id: '9', start: '16:00', end: '16:50', label: 'SLOT 9' },
  { id: '10', start: '16:50', end: '17:40', label: 'SLOT 10' },
  { id: '11', start: '17:40', end: '18:30', label: 'SLOT 11' },
  { id: '12', start: '18:30', end: '19:20', label: 'SLOT 12' },
];

export const generateSchedule = (seed) => {
  const courses = [
    { code: '23CSE312', name: 'Compilers', room: 'A-205', color: 'bg-green-50 text-green-700 border-green-200' },
    { code: '23CSE313', name: 'AI', room: 'B-202', color: 'bg-red-50 text-red-700 border-red-200' },
    { code: '23CSE314', name: 'Networks', room: 'A-201', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { code: '23MAT301', name: 'Lin. Algebra', room: 'C-105', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { code: '23CSE382', name: 'Soft Skills', room: 'Main Hall', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { code: 'PRJ-REV', name: 'Project Rev', room: 'Lab 3', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    null, null, null 
  ];

  const schedule = {};
  
  DAYS.forEach((day, dayIndex) => {
    schedule[day] = {};
    TIME_SLOTS.forEach((slot, slotIndex) => {
      if (slot.isBreak) return;
      const hash = (seed.length + dayIndex + slotIndex * 2) % courses.length;
      schedule[day][slot.id] = courses[hash];
    });
  });
  return schedule;
};

export const ANNOUNCEMENTS = [
    {
      id: 1,
      title: "End Semester Examination Schedule Released",
      date: "Feb 10, 2026",
      category: "Exam",
      isPinned: true,
      content: "The tentative schedule for the upcoming End Semester Examinations (May 2026) has been released. Please verify your course codes on AUMS.",
      color: "bg-red-100 text-red-700"
    },
    {
      id: 2,
      title: "Anokha 2026 Tech Fest Registration",
      date: "Feb 08, 2026",
      category: "Event",
      isPinned: true,
      content: "Early bird registrations for Anokha 2026 are now open! Visit the main portal to sign up for workshops and hackathons.",
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      id: 3,
      title: "Holiday Declaration: Mahashivaratri",
      date: "Feb 05, 2026",
      category: "General",
      isPinned: false,
      content: "The university will remain closed on Feb 16th, 2026 on account of Mahashivaratri. Library services will be unavailable.",
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 4,
      title: "Guest Lecture: AI in Healthcare",
      date: "Feb 02, 2026",
      category: "Academic",
      isPinned: false,
      content: "Join us for a session with Dr. P. Jayakumar on the impact of Generative AI in modern diagnostics. Venue: Main Auditorium.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: 5,
      title: "Placement Drive: Google Cloud",
      date: "Jan 28, 2026",
      category: "Career",
      isPinned: false,
      content: "Google Cloud Campus hiring for 2027 batch. Eligibility: CGPA > 8.0. Register before Friday.",
      color: "bg-green-100 text-green-700"
    }
];

import { 
    FileText,
    Trophy,
    Bell,
    BookOpen,
    UserCircle
} from 'lucide-react';

export const getAnnouncementIcon = (category) => {
    switch(category) {
        case 'Exam': return FileText;
        case 'Event': return Trophy;
        case 'General': return Bell;
        case 'Academic': return BookOpen;
        case 'Career': return UserCircle;
        default: return Bell;
    }
};
