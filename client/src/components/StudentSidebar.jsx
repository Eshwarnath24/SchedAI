import React, { useContext } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  LogOut,
  Megaphone,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const StudentSidebar = ({ mobileOpen, setMobileOpen, onLogout }) => {
  const location = useLocation();
  const activeTab = location.pathname;
  const { studentRollNo } = useContext(AppContext);
  const normalizedRoll = (studentRollNo || '').trim();
  const profileTitle = normalizedRoll || 'Student';
  const profileSubtitle = normalizedRoll ? `${normalizedRoll}@cb.students.amrita.edu` : 'student@cb.students.amrita.edu';

  const menuItems = [
    { id: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/student/section-timetable', label: 'Section Timetable', icon: Calendar },
    { id: '/student/teachers-timetable', label: 'Teachers Timetable', icon: Users },
    { id: '/student/announcements', label: 'Announcements', icon: Megaphone },
    { id: '/map', label: 'Map', icon: MapPin },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center justify-between lg:justify-start space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#A41034] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                A
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight">Amrita Vishwa</span>
                <span className="font-bold text-gray-900 leading-tight">Vidyapeetham</span>
              </div>
            </div>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="lg:hidden text-gray-500">
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                    ${isActive
                      ? 'bg-red-50 text-[#A41034]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{profileTitle}</p>
                <p className="text-xs text-gray-500 truncate">{profileSubtitle}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 text-[#A41034] font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
