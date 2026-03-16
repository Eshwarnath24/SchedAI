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
    Star,
    Menu,
    Loader2,
    Users,
    Briefcase
} from 'lucide-react';
import LeaveForm from './LeaveForm';
import Allocation from './Allocation';
import AdminSidebar from '../../components/AdminSidebar';
import InfoBlock from '../../components/InfoBlock';
import { useLocation } from 'react-router-dom';
import Logo from '../../components/Logo';

/**
 * AMRITA BRAND THEME - VIBRANT RED & YELLOW
 * Primary Maroon: #9b1c31
 * Accent Yellow: #ffcc00
 */
const customStyles = `
  .grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-areas:
      "area-1 area-1 area-1 area-1 area-2 area-2"
      "area-3 area-3 area-4 area-4 area-5 area-5"
      "area-6 area-6 area-6 area-6 area-5 area-5";
    gap: 20px;
    gap: 20px;
    width: 100%;
  }

  @media (max-width: 1280px) {
    .grid-container {
      grid-template-columns: repeat(4, 1fr);
      grid-template-areas:
        "area-1 area-1 area-1 area-1"
        "area-6 area-6 area-6 area-6"
        "area-2 area-2 area-5 area-5"
        "area-3 area-3 area-4 area-4";
    }
  }

  @media (max-width: 1024px) {
    .grid-container {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "area-1 area-1"
        "area-6 area-6"
        "area-2 area-2"
        "area-3 area-4"
        "area-5 area-5";
    }
  }

  @media (max-width: 768px) {
    .grid-container {
      grid-template-columns: 1fr;
      grid-template-areas:
        "area-1"
        "area-6"
        "area-2"
        "area-3"
        "area-4"
        "area-5";
    }
  }

  @media (max-width: 1024px) {
    .area-1, .area-2, .area-3, .area-4, .area-5, .area-6 { min-height: auto !important; }
  }

  .area-1 { grid-area: area-1; min-height: 440px; }
  .area-2 { grid-area: area-2; min-height: 440px; }
  .area-3 { grid-area: area-3; min-height: 340px; }
  .area-4 { grid-area: area-4; min-height: 340px; }
  .area-5 { grid-area: area-5; min-height: 700px; }
  .area-6 { grid-area: area-6; min-height: 340px; }

  .glass-card {
    background: white;
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .bg-brand-gradient {
    background: linear-gradient(135deg, #9b1c31 0%, #b32139 100%);
  }
  
  .text-brand { color: #9b1c31; }
  .bg-brand { background-color: #9b1c31; }
  .border-brand { border-color: #9b1c31; }
  .bg-accent { background-color: #ffcc00; }
  .text-accent { color: #ffcc00; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Dashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || (location.pathname.includes('leave') ? 'leave-form' : 'dashboard'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

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

    const [viewDate, setViewDate] = useState(new Date());
    const realToday = new Date();

    const currentMonthLabel = viewDate.toLocaleString('default', { month: 'long' });
    const currentYearNum = viewDate.getFullYear();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInCount = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const calendarDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInCount }, (_, i) => i + 1)];

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
            <style>{customStyles}</style>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
            fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative bg-[#FAF9F6] no-scrollbar">
                {/* Mobile Header Toggle */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <Logo type="scheduler" className="w-8 h-8" showText={false} textClassName="text-xl" />
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                </header>

                {/* CONTENT */}
                {activeTab === 'dashboard' ? (
                    <div className="p-5">
                        <div className="grid-container h-auto">

                            {/* AREA 1: ADMIN PROFILE & STATS GRID */}
                            <div className="area-1 glass-card p-0 flex flex-col lg:flex-col bg-white overflow-hidden border border-slate-200 rounded-[2.5rem]">
                                <div className="flex-1 relative p-8 md:p-12 bg-white flex flex-col justify-center">
                                    <div className="absolute top-0 left-0 w-48 h-48 bg-[#8B0000]/5 rounded-full -ml-24 -mt-24 blur-3xl opacity-60" />

                                    <div className="relative z-10">
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8B0000] text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-red-900/20">
                                                <Briefcase size={14} />
                                                PROFESSOR
                                            </span>
                                            <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200">
                                                <GraduationCap size={14} />
                                                CSE DEPT
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-8">
                                            <div className="relative shrink-0">
                                                <div className="absolute -inset-2 bg-red-100 rounded-[2.4rem] blur-xl opacity-40"></div>
                                                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2.2rem] bg-white p-1.5 shadow-2xl ring-1 ring-slate-100 overflow-hidden">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
                                                        alt="Admin"
                                                        className="w-full h-full object-cover rounded-[1.8rem] object-top"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                                                    Good Morning,<br className="hidden md:block" /> Srinivasan! 👋
                                                </h1>
                                                <p className="text-slate-500 text-lg font-medium">
                                                    You have <span className="text-[#8B0000] font-black underline decoration-[#8B0000]/20 underline-offset-4 pointer-events-none">2 classes</span> Now.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-auto grid grid-cols-2 border-t lg:border-t-0 lg:border-l border-slate-100 shrink-0 min-w-0 lg:min-w-[400px]">
                                    <InfoBlock
                                        icon={<BarChart3 />}
                                        label="Total Courses"
                                        value="06"
                                        className="border-r border-b border-slate-100"
                                        iconColor="text-blue-500"
                                    />
                                    <InfoBlock
                                        icon={<Users />}
                                        label="Students"
                                        value="248"
                                        className="border-b border-slate-100"
                                        iconColor="text-emerald-500"
                                    />
                                    <InfoBlock
                                        icon={<MapPin />}
                                        label="Campus"
                                        value="Ettimadai Main"
                                        className="border-r border-slate-100"
                                        iconColor="text-[#8B0000]"
                                    />
                                    <InfoBlock
                                        icon={<CalendarIcon />}
                                        label="Office Room"
                                        value="C-201"
                                        iconColor="text-violet-500"
                                    />
                                </div>
                            </div>

                            {/* AREA 2: CALENDAR */}
                            <div className="area-2 glass-card p-6 flex flex-col border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] font-sans">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-bold text-[#1a202c]">{currentMonthLabel} {currentYearNum}</h2>
                                    <div className="flex gap-4">
                                        <button onClick={prevMonth} className="text-slate-300 hover:text-slate-600 transition-colors"><ChevronLeft size={18} /></button>
                                        <button onClick={nextMonth} className="text-slate-300 hover:text-slate-600 transition-colors"><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-7 gap-y-4 gap-x-1 text-center">
                                    {weekDays.map((d, index) => (
                                        <div key={`weekday-${index}`} className="text-[11px] font-medium text-slate-400">{d}</div>
                                    ))}
                                    {calendarDays.map((day, i) => {
                                        if (!day) return <div key={`blank-${i}`} className="aspect-square"></div>;
                                        const isTodayItem = day === realToday.getDate() && viewDate.getMonth() === realToday.getMonth() && viewDate.getFullYear() === realToday.getFullYear();
                                        return (
                                            <div key={`day-${day}`} className="flex items-center justify-center aspect-square relative cursor-pointer">
                                                {isTodayItem ? (
                                                    <div className="w-10 h-8 bg-[#9b1c31] text-white flex items-center justify-center rounded-[10px] text-sm font-bold shadow-[0_4px_12px_rgba(155,28,49,0.25)] z-10 transition-transform hover:scale-105">
                                                        {day}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">{day}</span>
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
                                        <div key={`announcement-${item.id}`} className={`p-4 rounded-2xl border transition-all ${item.active ? 'bg-rose-50 border-brand shadow-sm' : 'bg-white border-slate-100'} `}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`text-[11px] font-bold leading-tight ${item.active ? 'text-brand' : 'text-slate-800'} `}>{item.title}</h4>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full">
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
                            < div className="area-4 glass-card p-6 bg-white border-rose-50" >
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
                                </div >
                            </div >

                            {/* AREA 5: TODAY'S SCHEDULE */}
                            < div className="area-5 glass-card bg-white p-8 border-l-4 border-l-brand" >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                        <Clock size={20} className="text-brand" /> Timeline
                                    </h2>
                                    <div className="bg-accent text-brand text-[9px] font-black px-3 py-1 rounded-full uppercase">Today</div>
                                </div>
                                <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                    {todaySchedule.map((item) => (
                                        <div key={item.id} className="relative pl-10 group">
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center transition-all z-10 ${item.active ? 'bg-brand shadow-lg scale-110' : 'bg-accent'} `}>
                                                {item.active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>}
                                            </div>
                                            <p className={`text-[10px] font-black uppercase mb-1 ${item.active ? 'text-brand' : 'text-slate-400'} `}>{item.time}</p>
                                            <h4 className={`text-xs font-bold ${item.active ? 'text-slate-900 scale-105 origin-left transition-transform' : 'text-slate-600'} `}>{item.subject}</h4>
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
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
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
                ) : activeTab === 'allocations' ? (
                    <Allocation />
                ) : (
                    <LeaveForm />
                )}

                {/* No dashboard side arrows */}

                <style>{customStyles}</style>
            </main>
        </div>
    );
};

export default Dashboard;