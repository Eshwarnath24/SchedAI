import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  LogOut,
  MapPin,
  User,
  Users,
  Clock,
  BookOpen,
  CalendarDays,
  AlertCircle,
  MessageSquare,
  Building2,
  MapPinned,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ClipboardList,
  Menu,
  X,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import InfoBlock from '../components/InfoBlock';
import { INITIAL_EVENTS, SLOTS } from '../utils/constants';




const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Grade OS Lab Reports", completed: false },
    { id: 2, text: "Prepare Discrete Math Quiz", completed: true },
    { id: 3, text: "CSE department head meeting", completed: false }
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask,
      completed: false
    };
    setTasks([task, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysEvents = INITIAL_EVENTS[today] || [];
  let scheduleData = todaysEvents.map(event => {
    const slot = SLOTS.find(s => s.id === event.slotId);
    return {
      time: slot ? slot.start : 'Unknown',
      courseCode: event.code,
      title: event.title,
      location: event.room,
      studentCount: event.studentCount
    };
  });

  // Filter to only upcoming classes
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  scheduleData = scheduleData.filter(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const eventTime = hours * 60 + minutes;
    return eventTime > currentTime;
  });

  const notifications = [
    { id: 1, text: "Faculty meeting in Hall B", time: "04:30 PM", type: "event", color: "text-amber-600 bg-amber-50" },
    { id: 2, text: "Submit attendance report", time: "By EOD", type: "task", color: "text-red-600 bg-red-50" },
    { id: 3, text: "New research grant open", time: "Notice", type: "info", color: "text-blue-600 bg-blue-50" },
    { id: 4, text: "Project review with final year students", time: "11:00 AM", type: "event", color: "text-emerald-600 bg-emerald-50" },
    { id: 5, text: "Department council meeting", time: "02:00 PM", type: "event", color: "text-purple-600 bg-purple-50" }

  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

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
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">

        {/* Mobile Header Toggle */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-slate-800">Amrita</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">

          <div className="flex flex-col xl:flex-row gap-8 mb-12">

            {/* Redesigned Teacher Info Section - Corrected 2x2 Layout */}
            <section className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-col min-h-[380px]">

              {/* Profile Side (Left) */}
              <div className="flex-1 relative p-8 md:p-12 bg-white flex flex-col justify-center">
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-[#8B0000]/5 rounded-full -ml-24 -mt-24 blur-3xl opacity-60" />

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8B0000] text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-red-900/20">
                      <Briefcase size={14} />
                      Associate Professor
                    </span>
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-200">
                      <GraduationCap size={14} />
                      CSE Dept
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-2 bg-red-100 rounded-[2.4rem] blur-xl opacity-40"></div>
                      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2.2rem] bg-white p-1.5 shadow-2xl ring-1 ring-slate-100 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
                          alt="Profile"
                          className="w-full h-full object-cover rounded-[1.8rem]"
                        />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                        Good Morning, Robert Sir! 👋
                      </h1>
                      <p className="text-slate-500 text-lg font-medium">
                        You have <span className="text-[#8B0000] font-black underline decoration-[#8B0000]/20 underline-offset-4">{scheduleData.length} classes</span> Now.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2x2 Info Grid (Right) - Sized properly for large screens */}
              <div className="w-full grid grid-cols-2 border-t lg:border-t-0 lg:border-l border-slate-100">
                <InfoBlock
                  icon={<BookOpen />}
                  label="Total Courses"
                  value="04"
                  className="border-r border-b border-slate-100"
                  iconColor="text-blue-500"
                />
                <InfoBlock
                  icon={<Users />}
                  label="Students"
                  value="142"
                  className="border-b border-slate-100"
                  iconColor="text-emerald-500"
                />
                <InfoBlock
                  icon={<MapPinned />}
                  label="Campus"
                  value="Ettimadai Main"
                  className="border-r border-slate-100"
                  iconColor="text-red-500"
                />
                <InfoBlock
                  icon={<Building2 />}
                  label="Office Room"
                  value="B, 402"
                  iconColor="text-purple-500"
                />
              </div>
            </section>

            {/* Right side Agenda & Calendar */}
            <aside className="w-full xl:w-[380px] 2xl:w-[420px] space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 px-2 text-left">
                  <h3 className="font-bold text-slate-800 text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-300 py-1">{day}</span>
                  ))}
                  {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => (
                    <div key={i} className={`text-[10px] md:text-xs py-2 rounded-xl transition-colors ${i + 1 === new Date().getDate() ? 'bg-[#8B0000] text-white font-bold shadow-lg shadow-red-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest mb-6 opacity-60 text-left">
                  <CalendarDays size={24} className="text-[#8B0000]" />
                  Agenda
                </h3>
                <div className="space-y-4">
                  {notifications.map(notif => (
                    <div key={notif.id} className="flex gap-4 group cursor-pointer text-left">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${notif.color}`}>
                        {notif.type === 'event' ? <Users size={16} /> : <AlertCircle size={16} />}
                      </div>
                      <div className="flex flex-col min-w-0 justify-center">
                        <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1 truncate">{notif.text}</p>
                        <span className="text-[11px] text-slate-400 font-medium">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* 5-column grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ===================== TEACHING SCHEDULE (RIGHT) ===================== */}
            <section className="lg:col-span-3 bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-10 text-left">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Teaching Schedule
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Live Class Roster
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {scheduleData.length > 0 ? (
                  scheduleData.map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-slate-100 rounded-[1.5rem] transition-all hover:border-[#8B0000]/20"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[100px] text-center shrink-0">
                        <span className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-[#8B0000] transition-colors">
                          {item.time}
                        </span>
                        <div className="h-1 w-8 bg-[#8B0000]/10 rounded-full mt-2"></div>
                      </div>

                      <div className="hidden md:block w-px h-12 bg-slate-100" />

                      <div className="flex-1 text-center md:text-left min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg tracking-wider shrink-0">
                            {item.courseCode}
                          </span>
                          <h3 className="text-lg font-bold text-slate-800 truncate">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 text-[11px] font-bold">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-[#8B0000]" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-blue-500" />
                            <span>{item.studentCount} Students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                    <div className="relative">
                      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-white shadow-lg rounded-full p-2">
                        <span className="text-xl">🎓</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3">Teaching Schedule Complete</h3>
                    <p className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed">
                      All your lectures and sessions for today have concluded. You're officially caught up on your academic calendar.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                        <Clock size={14} />
                        Duty Hours Concluded
                      </div>
                      <p className="text-slate-400 text-sm italic">
                        Have a restful evening, Professor.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ===================== TASKS (LEFT) ===================== */}
            <section className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
              <div className="flex items-center gap-4 mb-8 text-left">
                <div className="w-12 h-12 bg-[#8B0000] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/20 shrink-0">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Tasks
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    {tasks.filter(t => !t.completed).length} items pending
                  </p>
                </div>
              </div>

              <form onSubmit={addTask} className="mb-8 flex gap-3">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 focus:border-[#8B0000]/30 transition-all"
                />
                <button
                  type="submit"
                  className="p-4 bg-[#8B0000] text-white rounded-2xl hover:bg-[#660000] transition-all shrink-0"
                >
                  <Plus size={24} />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[450px]">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-4 p-5 rounded-[1.8rem] border transition-all ${task.completed
                      ? 'bg-slate-50/50 border-transparent opacity-50'
                      : 'bg-white border-slate-100 hover:border-[#8B0000]/20'
                      }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`shrink-0 transition-transform hover:scale-110 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-[#8B0000]'
                        }`}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>

                    <p
                      className={`text-base font-bold leading-tight flex-1 text-left ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                        }`}
                    >
                      {task.text}
                    </p>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="px-12 py-10 text-center border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.6em]">
            Amrita Vishwa Vidyapeetham • Ettimadai Campus • Academic Management
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;