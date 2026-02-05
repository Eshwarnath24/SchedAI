/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { Menu, Plus, MapPin, Trash2 } from "lucide-react";
import { AddEventModal } from "../components/AddEventModal";
import { EditEventModal } from "../components/EditEventModal";
import Sidebar from "../components/Sidebar";
import TopToolbar from "../components/TopToolbar";
import { DAYS, SLOTS } from "../utils/constants";
import { AppContext } from "../context/AppContext";
import {
  addClassToTimetable,
  cancelClassInTimetable,
  restoreClassInTimetable,
  shiftClassInTimetable,
} from "../utils/timetableData";

export default function TimetablePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState("week");
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayName = DAYS[currentTime.getDay() - 1] || (currentTime.getDay() === 6 ? "Saturday" : "");
  const [activeDay, setActiveDay] = useState(todayName || "Monday");

  const { events, setEvents } = useContext(AppContext);
  const [addModal, setAddModal] = useState({ isOpen: false, day: null, slotId: null });
  const [editModal, setEditModal] = useState({ isOpen: false, event: null, day: null, slotId: null });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getEventForSlot = (day, slotId) => events[day]?.find((e) => e.slotId === slotId);

  const isSlotCurrent = (slot) => {
    if (slot.isBreak) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const parse = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return now >= parse(slot.start) && now < parse(slot.end);
  };

  const getTypeStyles = (event) => {
    if (event.isCancelled) return "bg-slate-50 text-slate-300 border-slate-100 grayscale cursor-pointer";
    switch (event.type) {
      case "Lab": return "bg-blue-50 text-blue-800 border-blue-200 cursor-pointer";
      case "Review": return "bg-indigo-50 text-indigo-800 border-indigo-200 cursor-pointer";
      case "Meeting": return "bg-amber-50 text-amber-800 border-amber-200 cursor-pointer";
      default: return "bg-red-50 text-red-800 border-red-200 cursor-pointer";
    }
  };

  const handleSaveEvent = (newEvent) => {
    setEvents((prev) => {
      const { events: next, error } = addClassToTimetable(prev, addModal.day, newEvent);
      if (error) {
        alert(error);
        return prev;
      }
      return next;
    });
    setAddModal({ isOpen: false, day: null, slotId: null });
  };

  const handleDeleteEvent = (id, day, scope) => {
    setEvents((prev) => cancelClassInTimetable(prev, day, id, scope).events);
    setEditModal({ isOpen: false, event: null, day: null, slotId: null });
  };

  const handleRestoreEvent = (id, day) => {
    setEvents((prev) => restoreClassInTimetable(prev, day, id).events);
    setEditModal({ isOpen: false, event: null, day: null, slotId: null });
  };

  const handleShiftEvent = (id, oldDay, data) => {
    setEvents((prev) => {
      const { events: next, error } = shiftClassInTimetable(prev, id, oldDay, data);
      if (error) {
        alert(error);
        return prev;
      }
      return next;
    });
    setEditModal({ isOpen: false, event: null, day: null, slotId: null });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <AddEventModal {...addModal} onClose={() => setAddModal({ ...addModal, isOpen: false })} onSubmit={handleSaveEvent} />
      <EditEventModal {...editModal} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleShiftEvent} onDelete={handleDeleteEvent} onRestore={handleRestoreEvent} />

      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopToolbar 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
          view={view} 
          setView={setView}
          title="Timetable"
          subtitle="Ettimadai Campus"
        />

        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="h-full overflow-y-auto">
              <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-20">
                  <tr>
                    <th className="w-20 md:w-32 p-4 text-left text-xs uppercase text-slate-400 font-black tracking-widest">Time</th>
                    {view === "week" ? DAYS.map(day => (
                      <th key={day} className={`p-4 text-xs uppercase text-center font-black tracking-widest transition-colors ${day === todayName ? "text-[#8B0000] bg-red-50/50" : (day === activeDay ? "text-slate-900 underline decoration-[#8B0000] decoration-2" : "text-slate-400")}`}>
                        {day}
                        {day === todayName && <span className="block text-[10px] font-black mt-1 opacity-50">TODAY</span>}
                      </th>
                    )) : (
                      <th className="p-4 text-xs uppercase text-center text-[#8B0000] font-black tracking-widest">{activeDay}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot => (
                    <tr key={slot.id} className="group">
                      <td className="p-4 border-r border-slate-50 align-top bg-white">
                        <div className={`text-base md:text-lg font-black ${slot.isBreak ? "text-slate-200" : isSlotCurrent(slot) ? "text-[#8B0000]" : "text-slate-800"}`}>{slot.start}</div>
                        <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1 tracking-tighter">{slot.label}</div>
                      </td>
                      {view === "week" ? DAYS.map(day => {
                        const event = getEventForSlot(day, slot.id);
                        const isToday = day === todayName;
                        return (
                          <td key={day} className={`p-0 border border-slate-50 align-middle text-center h-20 md:h-24 transition-colors relative ${isToday ? "bg-red-50/10" : ""}`}>
                            {slot.isBreak ? (
                              <div className={`text-xs font-black uppercase tracking-widest ${isToday ? "text-red-200" : "text-slate-200"}`}>{slot.label === "Slot 7 (Lunch)" ? "Lunch" : "Interval"}</div>
                            ) : (
                              <div className="w-full h-full flex p-1">
                                {event ? (
                                  <div onClick={() => setEditModal({ isOpen: true, event, day, slotId: slot.id })} className={`flex-1 p-2 rounded-2xl border flex flex-col items-center justify-center transition-all hover:scale-[1.03] shadow-sm relative overflow-hidden ${getTypeStyles(event)}`}>
                                    {event.isCancelled && <div className="absolute top-0 right-0 p-1.5"><Trash2 size={10} className="text-red-300"/></div>}
                                    <div className={`text-xs font-black leading-tight ${event.isCancelled ? 'line-through opacity-40' : 'opacity-90'}`}>{event.code}</div>
                                    <div className="text-[11px] font-bold hidden md:block opacity-60 truncate max-w-full px-1">{event.title}</div>
                                    <div className="text-[10px] md:text-xs font-bold mt-1 opacity-80 bg-white/40 px-2 py-0.5 rounded-full">{event.room}</div>
                                  </div>
                                ) : (
                                  <button onClick={() => setAddModal({ isOpen: true, day, slotId: slot.id })} className={`flex-1 w-full h-full flex items-center justify-center transition-all rounded-2xl group/btn ${isToday ? "text-red-100 hover:text-[#8B0000] hover:bg-red-100/50" : "text-slate-100 hover:text-[#8B0000] hover:bg-red-50/50"}`}>
                                    <Plus size={20} strokeWidth={3} className="group-hover/btn:scale-125 transition-transform"/>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      }) : (
                        <td className="p-4">
                          {(() => {
                            const event = getEventForSlot(activeDay, slot.id);
                            return event ? (
                              <div onClick={() => setEditModal({ isOpen: true, event, day: activeDay, slotId: slot.id })} className={`p-8 rounded-[2rem] border shadow-md cursor-pointer transition-transform hover:scale-[1.01] ${getTypeStyles(event)}`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-sm font-black mb-1 opacity-60 tracking-widest uppercase">{event.code} {event.isCancelled && "(CANCELLED)"}</div>
                                    <div className={`text-3xl font-black ${event.isCancelled ? 'line-through' : ''}`}>{event.title}</div>
                                  </div>
                                  <div className="text-right space-y-2">
                                    <div className="flex items-center gap-2 text-base font-black justify-end"><MapPin size={16} /> Room {event.room}</div>
                                    <div className="text-xs font-black opacity-50 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full">{event.scope}</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setAddModal({ isOpen: true, day: activeDay, slotId: slot.id })} className="w-full border-2 border-dashed border-slate-100 rounded-[2rem] py-16 text-center text-slate-300 font-bold hover:border-[#8B0000]/20 hover:bg-red-50/20 hover:text-[#8B0000]/40 transition-all flex flex-col items-center gap-3">
                                <Plus size={32} strokeWidth={3} />
                                <span className="text-sm font-black uppercase tracking-widest">Add Schedule Entry</span>
                              </button>
                            );
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}