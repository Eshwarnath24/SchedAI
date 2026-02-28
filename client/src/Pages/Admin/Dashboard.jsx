import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Bell,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileText,
    UserCheck,
    BarChart3,
    GraduationCap,
    MapPin,
    Star
} from 'lucide-react';
import LeaveForm from './LeaveForm';

/**
 * AMRITA BRAND THEME - VIBRANT RED & YELLOW
 * Primary Maroon: #9b1c31
 * Accent Yellow: #ffcc00
 */
const customStyles = `
  .grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(7, 1fr);
    grid-template-areas:
      "area-1 area-1 area-1 area-2 area-2 area-2"
      "area-1 area-1 area-1 area-2 area-2 area-2"
      "area-1 area-1 area-1 area-2 area-2 area-2"
      "area-3 area-3 area-4 area-4 area-5 area-5"
      "area-3 area-3 area-4 area-4 area-5 area-5"
      "area-6 area-6 area-6 area-6 area-5 area-5"
      "area-6 area-6 area-6 area-6 area-5 area-5";
    gap: 20px;
    height: calc(100vh - 40px);
    width: 100%;
  }

  .area-1 { grid-area: area-1; }
  .area-2 { grid-area: area-2; }
  .area-3 { grid-area: area-3; }
  .area-4 { grid-area: area-4; }
  .area-5 { grid-area: area-5; }
  .area-6 { grid-area: area-6; }

  .glass-card {
    background: white;
    border-radius: 28px;
    border: 2px solid #f1f5f9;
    box-shadow: 0 10px 25px -10px rgba(155, 28, 49, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
  }
  
  .glass-card:hover {
    border-color: #ffcc00;
    box-shadow: 0 15px 35px -12px rgba(155, 28, 49, 0.2);
  }

  .bg-brand-gradient {
    background: linear-gradient(135deg, #9b1c31 0%, #b32139 100%);
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide { animation: slideIn 0.4s ease-out forwards; }
  
  .glow-yellow {
    box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
  }
`;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const announcements = [
        { id: 1, title: "Board of Studies Meeting", tag: "High", time: "2:00 PM Today", active: true },
        { id: 2, title: "NAAC Audit Documentation", tag: "Urgent", time: "Due by Friday", active: false },
        { id: 3, title: "Research Seminar: AI Ethics", tag: "General", time: "March 12", active: false }
    ];

    const leaveRequests = [
        { id: 1, name: "Dr. Ananya S.", type: "Casual Leave", status: "Pending", initial: "AS" },
        { id: 2, name: "Prof. Raghav", type: "On Duty", status: "Pending", initial: "PR" }
    ];

    const todaySchedule = [
        { id: 'sch-1', time: "09:00 - 10:00", subject: "Advanced Algorithms", room: "B-402", active: true },
        { id: 'sch-2', time: "11:30 - 12:30", subject: "Faculty Review", room: "Dept. Office", active: false },
        { id: 'sch-3', time: "14:00 - 15:30", subject: "PhD Viva Voce", room: "Conference Hall", active: false },
        { id: 'sch-4', time: "16:00 - 17:00", subject: "Curriculum Planning", room: "Virtual", active: false }
    ];

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="min-h-screen bg-[#fffdf5] font-sans">
            <style>{customStyles}</style>

            {/* TAB NAVIGATION */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8 items-center">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`text-sm font-bold uppercase tracking-wider transition-all pb-3 border-b-2 ${activeTab === 'dashboard'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('leave-form')}
                        className={`text-sm font-bold uppercase tracking-wider transition-all pb-3 border-b-2 ${activeTab === 'leave-form'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Leave Management
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            {activeTab === 'dashboard' ? (
                <div className="p-5 overflow-hidden">
                    <div className="grid-container">

                        {/* AREA 1: ADMIN PROFILE & WELCOME */}
                        <div className="area-1 glass-card bg-brand-gradient relative p-8 text-white border-none glow-yellow">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-accent text-brand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        <Star size={12} fill="currentColor" />
                                        Senior Academic Administrator
                                    </div>
                                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                                        Welcome back,<br />
                                        <span className="text-accent underline decoration-yellow-400 underline-offset-8">Dr. Srinivasan V.</span>
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                            <GraduationCap size={16} className="text-accent" />
                                            DEPT. OF COMPUTER SCIENCE
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                            <MapPin size={14} className="text-accent" />
                                            ETTIMADAI CAMPUS
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-accent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-accent shadow-2xl relative z-10">
                                        <img
                                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
                                            alt="Formal Admin"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-accent text-brand p-3 rounded-2xl shadow-xl z-20 border-2 border-brand">
                                        <UserCheck size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-[0.03] rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-1 bg-accent"></div>
                        </div>

                        {/* AREA 2: CALENDAR */}
                        <div className="area-2 glass-card p-6 flex flex-col border-rose-100 hover:border-accent">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <CalendarIcon size={18} className="text-brand" /> Academic Schedule
                                </h2>
                                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-black text-brand uppercase tracking-wider">MARCH 2024</span>
                                    <div className="flex gap-1 border-l pl-2 border-slate-200">
                                        <button className="p-1 rounded hover:bg-white hover:shadow-sm"><ChevronLeft size={14} /></button>
                                        <button className="p-1 rounded hover:bg-white hover:shadow-sm"><ChevronRight size={14} /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-7 gap-2 text-center">
                                {weekDays.map((d, index) => (
                                    <div key={`weekday-${index}`} className="text-[10px] font-black text-brand/40 pb-2">{d}</div>
                                ))}
                                {[...Array(31)].map((_, i) => {
                                    const day = i + 1;
                                    const isToday = day === 24;
                                    return (
                                        <div key={`day-${day}`} className={`flex items-center justify-center aspect-square rounded-2xl text-xs font-bold relative transition-all group ${isToday ? 'bg-brand text-white shadow-lg shadow-rose-900/20 scale-105' : 'hover:bg-accent/10 text-slate-600'}`}>
                                            {day}
                                            {(day === 24 || day === 27) && (
                                                <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-accent' : 'bg-brand'}`}></span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AREA 3: ANNOUNCEMENTS */}
                        <div className="area-3 glass-card p-6 bg-white border-rose-50">
                            <div className="flex items-center justify-between mb-5 border-b-2 border-accent pb-3">
                                <h2 className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Announcements</h2>
                                <Bell size={16} className="text-brand" />
                            </div>
                            <div className="space-y-4 overflow-y-auto no-scrollbar pr-1">
                                {announcements.map(item => (
                                    <div key={`announcement-${item.id}`} className={`p-4 rounded-2xl border transition-all ${item.active ? 'bg-rose-50 border-brand shadow-sm' : 'bg-white border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`text-[11px] font-bold leading-tight ${item.active ? 'text-brand' : 'text-slate-800'}`}>{item.title}</h4>
                                            <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black ${item.active ? 'bg-brand text-white' : 'bg-accent text-brand'}`}>
                                                {item.tag}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                                            <Clock size={10} /> {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AREA 4: LEAVE REQUESTS */}
                        <div className="area-4 glass-card p-6 bg-white border-rose-50">
                            <div className="flex items-center justify-between mb-5 border-b-2 border-accent pb-3">
                                <h2 className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Leave Requests</h2>
                                <FileText size={16} className="text-brand" />
                            </div>
                            <div className="space-y-4 overflow-y-auto no-scrollbar pr-1">
                                {leaveRequests.map(req => (
                                    <div key={`leave-${req.id}`} className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-accent hover:bg-white transition-all shadow-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-brand text-accent flex items-center justify-center font-black text-xs shadow-md">
                                            {req.initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[11px] font-black text-slate-800 truncate">{req.name}</h4>
                                            <p className="text-[9px] text-brand font-bold bg-accent/20 inline-block px-1.5 rounded mt-0.5">{req.type}</p>
                                        </div>
                                        <button className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand border border-slate-100 hover:bg-brand hover:text-white transition-colors">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AREA 5: TODAY'S SCHEDULE */}
                        <div className="area-5 glass-card bg-white p-8 border-l-4 border-l-brand">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Clock size={20} className="text-brand" /> Timeline
                                </h2>
                                <div className="bg-accent text-brand text-[9px] font-black px-3 py-1 rounded-full uppercase">Today</div>
                            </div>
                            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                {todaySchedule.map((item) => (
                                    <div key={item.id} className="relative pl-10 group">
                                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center transition-all ${item.active ? 'bg-brand shadow-lg scale-110' : 'bg-accent'}`}>
                                            {item.active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>}
                                        </div>
                                        <p className={`text-[10px] font-black uppercase mb-1 ${item.active ? 'text-brand' : 'text-slate-400'}`}>{item.time}</p>
                                        <h4 className={`text-xs font-bold ${item.active ? 'text-slate-900 scale-105 origin-left transition-transform' : 'text-slate-600'}`}>{item.subject}</h4>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1.5">
                                            <MapPin size={10} className="text-accent" /> {item.room}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AREA 6: WORKLOAD OVERVIEW */}
                        <div className="area-6 glass-card p-10 bg-white border-t-4 border-t-accent">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10">Efficiency Dashboard</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-12">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Load</p>
                                            <span className="text-5xl font-black text-brand tracking-tighter">84%</span>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-brand h-full w-[84%] rounded-full shadow-lg"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Goal</p>
                                            <span className="text-5xl font-black text-slate-800 tracking-tighter">62%</span>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-accent h-full w-[62%] rounded-full shadow-lg"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 hidden lg:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Tasks</p>
                                            <span className="text-5xl font-black text-slate-800 tracking-tighter">95%</span>
                                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                                <div className="bg-slate-800 h-full w-[95%] rounded-full shadow-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <BarChart3 className="text-slate-50 opacity-20" size={100} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LeaveForm />
            )}

            <style>{customStyles}</style>
        </div>
    );
};

export default Dashboard;