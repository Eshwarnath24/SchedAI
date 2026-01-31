import React, { useState, useEffect } from 'react';
import { Menu, Plus, MapPin } from "lucide-react";

import SidebarContent from '../components/SidebarContent';
import AddSessionModal from '../components/AddSessionModal';
import ManageSessionModal from '../components/ManageSessionModal';
import { SLOTS, DAYS, INITIAL_EVENTS, COLORS } from '../utils/constants';

const scrollbarHideStyles = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const Timetable = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState('week');

  const [teacherSchedule, setTeacherSchedule] = useState(INITIAL_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ day: '', slotId: null });
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getEventForSlot = (day, slotId) => 
    teacherSchedule[day]?.find((e) => e.slotId === slotId);

  const isSlotCurrent = (slot) => {
    if (slot.isBreak) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const parse = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return now >= parse(slot.start) && now < parse(slot.end);
  };

  const handleCellClick = (day, slotId, session = null) => {
    if (session) {
      setSelectedSession({ ...session, day });
      setShowManageModal(true);
    } else {
      setSelectedCell({ day, slotId });
      setShowAddModal(true);
    }
  };

  const handleAddAction = () => {
    const newClass = { 
      slotId: selectedCell.slotId, 
      code: 'NEW101', 
      title: 'Assigned Class', 
      type: 'Theory', 
      room: 'A201', 
      section: 'A',
      color: 'rose'
    };
    setTeacherSchedule(prev => ({
      ...prev,
      [selectedCell.day]: [...(prev[selectedCell.day] || []), newClass]
    }));
    setShowAddModal(false);
  };

  const handleDeleteAction = () => {
    setTeacherSchedule(prev => ({
      ...prev,
      [selectedSession.day]: prev[selectedSession.day].filter(s => s.slotId !== selectedSession.slotId)
    }));
    setShowManageModal(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-left">
      <style>{scrollbarHideStyles}</style>

      <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      
      <aside className={`fixed top-0 left-0 bottom-0 w-72 z-[70] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-4 md:p-6 lg:p-8 bg-white border-b flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-slate-200"><Menu size={24} /></button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Academic Matrix</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ettimadai Campus</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setView('week')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${view === 'week' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-slate-500'}`}>Week View</button>
              <button onClick={() => setView('day')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${view === 'day' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-slate-500'}`}>Day View</button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8 pt-2">
          <div className="h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden text-center">
            <div className="flex-1 overflow-auto no-scrollbar pb-24">
              <table className={`w-full border-collapse ${view === 'week' ? 'min-w-[1400px]' : 'table-fixed'}`}>
                <thead className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md shadow-sm">
                  <tr>
                    {view === 'week' ? (
                      <>
                        <th className="sticky left-0 bg-slate-50 z-40 w-32 p-6 border-r border-b text-center text-[10px] font-black uppercase text-slate-400">Day</th>
                        {SLOTS.map(slot => (
                          <th key={slot.id} className="p-6 border-b text-center min-w-[120px]">
                            <div className={`text-xs font-black ${slot.isBreak ? 'text-transparent' : 'text-slate-800'}`}>{slot.start}</div>
                            <div className={`text-[9px] font-black uppercase tracking-wider ${slot.isBreak ? 'text-slate-300' : 'text-slate-400'}`}>{slot.label}</div>
                          </th>
                        ))}
                      </>
                    ) : (
                      <>
                        <th className="sticky left-0 bg-slate-50 z-40 w-32 p-6 border-r border-b text-center text-[10px] font-black uppercase text-slate-400">Time</th>
                        <th className="p-6 border-b text-[#8B0000] font-black uppercase tracking-widest bg-red-50/30">{activeDay} Roster</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {view === 'week' ? (
                    DAYS.map(day => (
                      <tr key={day} className="h-32">
                        <td className="sticky left-0 bg-white border-r border-b p-4 align-middle font-black text-[#8B0000] shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] uppercase tracking-widest text-[10px]">{day}</td>
                        {SLOTS.map(slot => {
                          const session = getEventForSlot(day, slot.id);
                          return (
                            <td key={slot.id} className="border border-slate-100 p-2 align-middle">
                              {slot.isBreak ? (
                                <div className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Interval</div>
                              ) : session ? (
                                <div onClick={() => handleCellClick(day, slot.id, session)} className={`h-full w-full rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer ${COLORS[session.type]}`}>
                                  <span className="text-[10px] font-black truncate w-full">{session.code}</span>
                                  <span className="text-[8px] font-bold opacity-60 mt-1 flex items-center justify-center gap-1"><MapPin size={8}/> {session.room}</span>
                                </div>
                              ) : (
                                <div onClick={() => handleCellClick(day, slot.id)} className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer text-slate-300"><Plus size={18} /></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    SLOTS.map(slot => {
                      const activeSlot = isSlotCurrent(slot);
                      const session = getEventForSlot(activeDay, slot.id);
                      return (
                        <tr key={slot.id} className="h-32">
                          <td className="sticky left-0 bg-white border-r border-b p-4 align-middle">
                            <div className={`text-lg font-black ${slot.isBreak ? 'text-transparent' : activeSlot ? 'text-[#8B0000]' : 'text-slate-800'}`}>{slot.start}</div>
                            <div className={`text-[9px] uppercase tracking-widest ${slot.isBreak ? 'text-slate-300' : 'text-slate-400'}`}>{slot.label}</div>
                          </td>
                          <td className="border-b p-4 align-middle">
                            {slot.isBreak ? (
                              <div className="py-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-200 text-xs font-black uppercase tracking-[1em]">{slot.label}</div>
                            ) : session ? (
                              <div onClick={() => handleCellClick(activeDay, slot.id, session)} className={`p-8 rounded-[2.5rem] border-2 flex items-center justify-between transition-all hover:shadow-xl cursor-pointer ${COLORS[session.type]}`}>
                                <div className="text-left flex-1 flex flex-col items-center">
                                  <span className="text-xs font-black uppercase opacity-60 tracking-widest">{session.type} — SEC {session.section}</span>
                                  <h4 className="text-2xl font-black">{session.subject}</h4>
                                </div>
                                <div className="text-right flex-1 flex flex-col items-center">
                                  <div className="flex items-center gap-2 font-black text-lg text-slate-900"><MapPin size={18} className="text-[#8B0000]" /> {session.room}</div>
                                  <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Timings: {slot.start}</div>
                                </div>
                              </div>
                            ) : (
                              <div onClick={() => handleCellClick(activeDay, slot.id)} className="py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-200 font-black hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-[0.4em] text-xs">+ Assign Slot</div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AddSessionModal show={showAddModal} onClose={() => setShowAddModal(false)} selectedCell={selectedCell} slots={SLOTS} onAdd={handleAddAction} />
      <ManageSessionModal show={showManageModal} onClose={() => setShowManageModal(false)} session={selectedSession} onDelete={handleDeleteAction} />

      {view === 'day' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl flex gap-1 shadow-2xl z-[80] border border-white/10">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)} className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${activeDay === day ? "bg-[#8B0000] text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>{day.slice(0, 3)}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;