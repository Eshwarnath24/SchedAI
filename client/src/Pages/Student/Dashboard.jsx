import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  UserCircle,
  Bell,
  Megaphone
} from 'lucide-react';
import StudentLayout from './Layout';
import { ANNOUNCEMENTS, getAnnouncementIcon, SECTIONS } from '../../utils/mockData';
import { AppContext } from '../../context/AppContext';
import { getUpdatesForSection } from '../../utils/scheduleUpdates';

const Dashboard = () => {
  const navigate = useNavigate();
  const { studentRollNo, studentProfile } = useContext(AppContext);
  const welcomeName = (studentRollNo || '').trim() || 'Student';
  const derivedSection = studentProfile?.sectionName || SECTIONS[0];
  const sectionUpdates = getUpdatesForSection(derivedSection);

  const getUpdateColor = (type) => {
    switch(type) {
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
          You have <span className="font-bold text-white">2 classes</span> remaining today. Your next class starts in 45 minutes.
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
              Up Next
            </h3>
            <span className="text-xs font-bold bg-red-50 text-[#A41034] px-2 py-1 rounded">10:50 AM</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-[#A41034]">
            <div className="text-sm text-gray-500 font-bold mb-1">23CSE312</div>
            <div className="text-lg font-bold text-gray-900 mb-2">Compiler Design</div>
            <div className="flex items-center text-sm text-gray-600 gap-4">
              <span className="flex items-center gap-1"><MapPin size={14}/> A-205</span>
              <span className="flex items-center gap-1"><UserCircle size={14}/> Dr. Robert</span>
            </div>
          </div>
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
          )})}
        </div>
      </div>
    </div>
    </StudentLayout>
  );
};

export default Dashboard;
