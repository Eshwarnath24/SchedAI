import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  UserCircle,
  Bell,
  Megaphone,
  Loader2
} from 'lucide-react';
import StudentLayout from './Layout';
import { ANNOUNCEMENTS, getAnnouncementIcon, SECTIONS } from '../../utils/mockData';
import { AppContext } from '../../context/AppContext';
import { getUpdatesForSection } from '../../utils/scheduleUpdates';
import { fetchSections, fetchSectionSchedule, fetchTimeSlots } from '../../utils/api';

// Frontend TIME_SLOTS definition (same as mockData.js) used for time calculations
const SLOT_TIMES = [
  { id: '1', start: '08:00', end: '08:50' },
  { id: '2', start: '08:50', end: '09:40' },
  { id: '3', start: '09:40', end: '10:30' },
  { id: '4', start: '10:50', end: '11:40' },
  { id: '5', start: '11:40', end: '12:30' },
  { id: '6', start: '13:30', end: '14:20' },
  { id: '8', start: '14:05', end: '14:55' },
  { id: '9', start: '14:55', end: '15:45' },
  { id: '10', start: '15:45', end: '16:35' },
  { id: '11', start: '16:35', end: '17:25' },
  { id: '12', start: '17:25', end: '18:15' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { studentRollNo, studentProfile } = useContext(AppContext);
  const welcomeName = studentProfile?.normalized
    ? (studentRollNo || '').trim() || 'Student'
    : 'Student';
  const derivedSection = studentProfile?.sectionName || SECTIONS[0];
  const sectionId = studentProfile?.sectionId || null;
  const [sectionUpdates, setSectionUpdates] = useState([]);

  // Dynamic schedule state
  const [schedule, setSchedule] = useState(null);
  const [resolvedSectionId, setResolvedSectionId] = useState(sectionId);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [nextClass, setNextClass] = useState(null);
  const [remainingCount, setRemainingCount] = useState(0);
  const [minutesUntilNext, setMinutesUntilNext] = useState(null);

  // Resolve sectionId from sectionName (same pattern as SectionTimeTable.jsx)
  useEffect(() => {
    const loadSectionId = async () => {
      if (sectionId) {
        setResolvedSectionId(sectionId);
        return;
      }
      try {
        const sections = await fetchSections();
        const sectionName = studentProfile?.sectionName || '';
        const matched = sections.find(s => s.name === sectionName);
        if (matched) {
          setResolvedSectionId(matched._id);
        } else {
          // Partial match fallback
          const partialMatch = sections.find(s =>
            s.name.includes(studentProfile?.sectionLetter || '') &&
            s.name.includes(studentProfile?.branch || '')
          );
          if (partialMatch) {
            setResolvedSectionId(partialMatch._id);
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not resolve section ID:', err.message);
      }
    };
    loadSectionId();
  }, [sectionId, studentProfile]);

  // Fetch section schedule once we have the sectionId
  useEffect(() => {
    if (!resolvedSectionId) return;
    const loadSchedule = async () => {
      setScheduleLoading(true);
      try {
        const data = await fetchSectionSchedule(resolvedSectionId);
        setSchedule(data.schedule || {});
      } catch (err) {
        console.warn('⚠️ Could not load section schedule:', err.message);
        setSchedule(null);
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, [resolvedSectionId]);

  // Fetch section updates
  useEffect(() => {
    if (resolvedSectionId) {
      getUpdatesForSection(resolvedSectionId).then(setSectionUpdates);
    }
  }, [resolvedSectionId]);

  // Compute next class and remaining count from schedule and current time
  useEffect(() => {
    if (!schedule) return;

    const computeNextClass = () => {
      const now = new Date();
      const currentDay = DAY_NAMES[now.getDay()];
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      // Get today's schedule (try both cases)
      const todaySchedule = schedule[currentDay] || schedule[currentDay.toUpperCase()] || {};

      // Collect all classes for today with their time info
      const todayClasses = [];
      Object.entries(todaySchedule).forEach(([slotId, classData]) => {
        if (!classData || classData.status === 'CANCELLED') return;
        const slotTime = SLOT_TIMES.find(s => s.id === slotId);
        if (slotTime) {
          todayClasses.push({ ...classData, slotId, startTime: slotTime.start, endTime: slotTime.end });
        }
      });

      // Sort by start time
      todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Find remaining classes (those that haven't ended yet)
      const remaining = todayClasses.filter(cls => cls.endTime > currentTimeStr);
      setRemainingCount(remaining.length);

      // Find next upcoming class (starts after current time)
      const upcoming = todayClasses.filter(cls => cls.startTime > currentTimeStr);
      // Or if a class is currently in session, show that
      const inSession = todayClasses.find(
        cls => cls.startTime <= currentTimeStr && cls.endTime > currentTimeStr
      );

      if (inSession) {
        setNextClass({ ...inSession, isNow: true });
        setMinutesUntilNext(0);
      } else if (upcoming.length > 0) {
        const next = upcoming[0];
        setNextClass({ ...next, isNow: false });
        // Calculate minutes until next class
        const [nextH, nextM] = next.startTime.split(':').map(Number);
        const diffMs = (nextH * 60 + nextM) - (currentHour * 60 + currentMin);
        setMinutesUntilNext(diffMs > 0 ? diffMs : 0);
      } else {
        setNextClass(null);
        setMinutesUntilNext(null);
      }
    };

    computeNextClass();
    // Recompute every minute
    const interval = setInterval(computeNextClass, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const getUpdateColor = (type) => {
    switch (type) {
      case 'CANCELLED': return 'bg-red-500';
      case 'EXTRA': return 'bg-green-500';
      case 'RESCHEDULED': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  const getUpdateText = (u) => {
    if (u.type === 'CANCELLED') return `${u.courseCode || u.originalCourseCode} Cancelled`;
    if (u.type === 'EXTRA') return `Extra Class: ${u.course.name}`;
    if (u.type === 'RESCHEDULED') return `Rescheduled: ${u.newCourse.name}`;
    return 'Update';
  };

  // Format remaining time
  const formatTimeUntil = (mins) => {
    if (mins === null || mins === undefined) return '';
    if (mins === 0) return 'Happening now';
    if (mins < 60) return `in ${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
  };

  // Welcome message text
  const getWelcomeSubtext = () => {
    if (scheduleLoading) return 'Loading your schedule...';
    if (!schedule) return 'Unable to load schedule data.';
    if (remainingCount === 0) return 'No more classes remaining today. Enjoy your free time!';
    if (nextClass?.isNow) {
      return (
        <>
          You have <span className="font-bold text-white">{remainingCount} {remainingCount === 1 ? 'class' : 'classes'}</span> remaining today. Your current class is in session.
        </>
      );
    }
    if (minutesUntilNext !== null) {
      return (
        <>
          You have <span className="font-bold text-white">{remainingCount} {remainingCount === 1 ? 'class' : 'classes'}</span> remaining today. Your next class starts {formatTimeUntil(minutesUntilNext)}.
        </>
      );
    }
    return (
      <>
        You have <span className="font-bold text-white">{remainingCount} {remainingCount === 1 ? 'class' : 'classes'}</span> remaining today.
      </>
    );
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#A41034] to-[#8a0d2b] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <div className="w-64 h-64 rounded-full bg-white blur-3xl"></div>
          </div>

          <h1 className="text-3xl font-bold mb-2 relative z-10">Welcome back, {welcomeName}!</h1>
          <p className="text-red-100 mb-6 max-w-lg relative z-10">
            {getWelcomeSubtext()}
          </p>

          <div className="flex flex-wrap gap-3 relative z-10">
            <button
              onClick={() => navigate('/student/section-timetable')}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              View Full Timetable
            </button>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Class Widget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={18} className="text-[#A41034]" />
                {nextClass?.isNow ? 'In Session' : 'Up Next'}
              </h3>
              {scheduleLoading ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : nextClass ? (
                <span className="text-xs font-bold bg-red-50 text-[#A41034] px-2 py-1 rounded">
                  {nextClass.isNow ? `Now • ends ${nextClass.endTime}` : nextClass.startTime}
                </span>
              ) : null}
            </div>
            {scheduleLoading ? (
              <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-200 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : nextClass ? (
              <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-[#A41034]">
                <div className="text-sm text-gray-500 font-bold mb-1">{nextClass.code}</div>
                <div className="text-lg font-bold text-gray-900 mb-2">{nextClass.name}</div>
                <div className="flex items-center text-sm text-gray-600 gap-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {nextClass.room || 'TBA'}</span>
                  <span className="flex items-center gap-1"><UserCircle size={14} /> {nextClass.faculty || 'Unassigned'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-green-400 text-center">
                <p className="text-gray-500 font-medium">🎉 No more classes today!</p>
              </div>
            )}
          </div>

          {/* Quick Links / Updates */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 cursor-pointer hover:text-[#A41034]" onClick={() => navigate('/student/section-timetable')}>
                <Bell size={18} className="text-orange-500" />
                Schedule Updates
              </h3>
            </div>
            <div className="space-y-3">
              {sectionUpdates.length > 0 ? (
                sectionUpdates.map(u => (
                  <div key={u.id} className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getUpdateColor(u.type)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{getUpdateText(u)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.day} / Slot {u.slotId} • {u.reason}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No recent schedule changes.</p>
              )}
            </div>
          </div>
        </div>

        {/* Latest Announcements Section (Bottom) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Megaphone size={20} className="text-[#A41034]" />
              Latest Announcements
            </h3>
            <button
              onClick={() => navigate('/student/announcements')}
              className="text-sm font-bold text-[#A41034] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ANNOUNCEMENTS.slice(0, 3).map((item) => {
              const Icon = getAnnouncementIcon(item.category);
              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => navigate('/student/announcements')}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.color} group-hover:scale-105 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#A41034] transition-colors">{item.title}</h4>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{item.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
