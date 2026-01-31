import React from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  X, 
  LogOut 
} from "lucide-react";

const SidebarContent = ({ onClose, activeTab, setActiveTab }) => (
  <div className="flex flex-col h-full bg-white border-r border-slate-100 shadow-xl lg:shadow-none">
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">A</div>
          <span className="text-sm font-bold tracking-tight text-[#1A202C] leading-tight text-left">Amrita Vishwa Vidyapeetham</span>
        </div>
        <button className="lg:hidden p-2 text-slate-500" onClick={onClose}><X size={24} /></button>
      </div>
      <nav className="space-y-1">
        <button onClick={() => { setActiveTab("dashboard"); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "dashboard" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button onClick={() => { setActiveTab("calendar"); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === "calendar" ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}>
          <CalendarIcon size={20} /> Timetable
        </button>
      </nav>
    </div>
    <div className="mt-auto p-6 border-t border-slate-100">
      <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-slate-300 shrink-0 overflow-hidden ring-2 ring-white">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="text-sm font-bold text-slate-800 truncate">Dr. Robert Fox</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase truncate">Associate Professor</span>
        </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  </div>
);

export default SidebarContent;