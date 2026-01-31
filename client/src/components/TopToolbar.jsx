import React from 'react';
import { Menu, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const TopToolbar = ({ onOpenSidebar, view, setView, title = "Academic Matrix", subtitle = "Odd Semester • Ettimadai" }) => {
  return (
    <div className="p-4 md:p-6 lg:p-8 pb-0 shrink-0">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onOpenSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24} /></button>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
              <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setView('week')} 
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-black transition-all ${
                  view === 'week' ? 'bg-white shadow-sm text-[#8B0000]' : 'text-slate-500'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setView('day')} 
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-black transition-all ${
                  view === 'day' ? 'bg-white shadow-sm text-[#8B0000]' : 'text-slate-500'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Search Matrix..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 rounded-xl text-xs font-medium border-transparent focus:bg-white focus:ring-2 focus:ring-[#8B0000]/10 transition-all outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-500 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all"><Filter size={14} /> Filter</button>
            <div className="flex border-l border-slate-100 pl-2">
              <button className="p-2 text-slate-300"><ChevronLeft size={18}/></button>
              <button className="p-2 text-slate-300"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopToolbar;