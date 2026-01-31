import React, { useState } from "react";
import { X, Trash2, ArrowRightLeft, CalendarClock } from "lucide-react";
import { SLOTS } from "../utils/constants";

const ManageEventModal = ({ isOpen, event, day, onClose, events, onUpdate }) => {
    const [scope, setScope] = useState("today"); // "today" or "semester"
    const [newSlotId, setNewSlotId] = useState("");

    if (!isOpen || !event) return null;

    const handleCancelClass = () => {
        // In a real app, "today" would check a specific date. 
        // Here we filter it out of the current state.
        const updatedEvents = events.filter(e => e.slotId !== event.slotId);
        onUpdate(updatedEvents);
        onClose();
    };

    const handleShiftClass = () => {
        if (!newSlotId) return;

        // 1. Remove from old slot
        const filteredEvents = events.filter(e => e.slotId !== event.slotId);
        
        // 2. Add to new slot
        const shiftedEvent = { ...event, slotId: newSlotId };
        
        onUpdate([...filteredEvents, shiftedEvent]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Manage Class</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.code} • {day}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Scope Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <CalendarClock size={12} /> Apply Changes For
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                            <button 
                                onClick={() => setScope("today")}
                                className={`py-2 text-xs font-bold rounded-lg transition-all ${scope === 'today' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-slate-500'}`}
                            >
                                For Today
                            </button>
                            <button 
                                onClick={() => setScope("semester")}
                                className={`py-2 text-xs font-bold rounded-lg transition-all ${scope === 'semester' ? 'bg-white text-[#8B0000] shadow-sm' : 'text-slate-500'}`}
                            >
                                Complete Sem
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Shift Logic */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <ArrowRightLeft size={12} /> Shift to Timing
                        </label>
                        <div className="flex gap-2">
                            <select 
                                value={newSlotId}
                                onChange={(e) => setNewSlotId(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">Select New Slot</option>
                                {SLOTS.filter(s => !s.isBreak).map(slot => (
                                    <option key={slot.id} value={slot.id}>{slot.start} ({slot.label})</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleShiftClass}
                                disabled={!newSlotId}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black disabled:opacity-50"
                            >
                                SHIFT
                            </button>
                        </div>
                    </div>

                    {/* Delete Logic */}
                    <button 
                        onClick={handleCancelClass}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-50 text-red-600 hover:bg-red-50 transition-all font-black text-sm"
                    >
                        <Trash2 size={18} />
                        CANCEL CLASS {scope === 'today' ? 'FOR TODAY' : 'PERMANENTLY'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageEventModal;