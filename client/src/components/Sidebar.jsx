import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  X,
  LogOut,
  BarChart3,
  FileText,
  Users,
  Megaphone,
  Activity,
  MapPin
} from "lucide-react";

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentTeacher } = useContext(AppContext);
  const activeTab = location.pathname.slice(1) || 'dashboard'; // Remove leading slash, default to dashboard

  const handleLogout = () => {
    logout();
    navigate('/auth');
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 shadow-xl lg:shadow-none">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">A</div>
            <span className="text-md font-bold tracking-tight text-[#1A202C] leading-tight text-left">Amrita Vishwa Vidyapeetham</span>
          </div>
          <button className="lg:hidden p-2 text-slate-500" onClick={onClose}><X size={24} /></button>
        </div>
        <nav className="space-y-1">
          <Link to="/dashboard" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "dashboard" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/time-table" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "time-table" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <CalendarIcon size={20} /> Timetable
          </Link>
          <Link to="/workload" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "workload" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <BarChart3 size={20} /> Workload
          </Link>
          <Link to="/reports" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "reports" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <Activity size={20} /> Reports
          </Link>
          <Link to="/leave-form" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "leave-form" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <FileText size={20} /> Leave Form
          </Link>
          <Link to="/allocations" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "allocations" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <Users size={20} /> Allocations
          </Link>
          <Link to="/announcements" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "announcements" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <Megaphone size={20} /> Announcements
          </Link>
          <Link to="/map" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "map" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
            <MapPin size={20} /> Map
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-slate-300 shrink-0 overflow-hidden ring-2 ring-white">
            <img src={currentTeacher?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate">{currentTeacher?.name || 'Faculty'}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase truncate">{currentTeacher?.designation || 'Faculty'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;