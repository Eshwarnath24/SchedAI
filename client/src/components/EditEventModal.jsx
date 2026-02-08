import React, { useState, useEffect } from "react";
import { X, Trash2, RefreshCw, Move } from "lucide-react";
import { DAYS, SLOTS } from "../utils/constants";

export const EditEventModal = ({ isOpen, onClose, onUpdate, onMarkCancelled, onMarkScheduled, event, day, slotId }) => {
  const initialFormData = {
    scope: event?.cancelScope || 'Today',
    newDay: day || '',
    newSlotId: slotId || ''
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isOpen && event) {
      const newData = {
        scope: event.cancelScope || 'Today',
        newDay: day || '',
        newSlotId: slotId || ''
      };
      // eslint-disable-next-line
      setFormData(prev => {
        if (prev.scope !== newData.scope || prev.newDay !== newData.newDay || prev.newSlotId !== newData.newSlotId) {
          return newData;
        }
        return prev;
      });
    }
    // Only run when modal is opened or event/day/slotId changes
  }, [isOpen, event, day, slotId]);

  if (!isOpen || !event) return null;

  const status = event.status || 'scheduled';
  const isCancelled = status === 'cancelled' || event.isCancelled;
  const isCompleted = status === 'completed';
  const isScheduled = status === 'scheduled' || (!status && !event.isCancelled);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#8B0000] p-8 text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black tracking-tight">{isCancelled ? 'Cancelled Class' : 'Manage Class'}</h3>
            <div className="flex items-center gap-2 mt-2">
               <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">{event.code}</span>
               <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{day} • Slot {slotId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* Class Status Display */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Current Status</div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                isCompleted ? 'bg-green-100 text-green-800' :
                isCancelled ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {isCompleted ? '✓ Completed' : isCancelled ? '✗ Cancelled' : '○ Scheduled'}
              </div>
            </div>
            {isScheduled && (
              <p className="text-[9px] text-slate-500 mt-2 italic">
                * Classes are automatically marked as completed when time ends
              </p>
            )}
          </div>

          {/* Status Actions */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Manual Status Override</label>
            <div className="space-y-2">
              {!isCancelled && (
                <button
                  onClick={() => onMarkCancelled(event.id, day, formData.scope)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 py-4 rounded-2xl text-xs font-black uppercase text-white shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Trash2 size={14} /> Mark as Cancelled
                </button>
              )}
              {(isCancelled || isCompleted) && (
                <button
                  onClick={() => onMarkScheduled(event.id, day)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 py-4 rounded-2xl text-xs font-black uppercase text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <RefreshCw size={14} /> Mark as Scheduled
                </button>
              )}
            </div>
          </div>

          {/* Reschedule Section - Only for non-completed classes */}
          {!isCompleted && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Update Scope</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  {['Today', 'Complete Sem'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFormData({ ...formData, scope: s })}
                      className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${formData.scope === s ? 'bg-white shadow-sm text-[#8B0000]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Reschedule (Shift Class)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Target Day</span>
                    <select 
                      value={formData.newDay}
                      onChange={e => setFormData({...formData, newDay: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#8B0000]/10 focus:bg-white rounded-2xl text-sm font-bold outline-none appearance-none transition-all"
                    >
                      <option value="" disabled>Select Day</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Target Slot</span>
                    <select 
                      value={formData.newSlotId}
                      onChange={e => setFormData({...formData, newSlotId: parseInt(e.target.value)})}
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#8B0000]/10 focus:bg-white rounded-2xl text-sm font-bold outline-none appearance-none transition-all"
                    >
                      <option value="" disabled>Select Slot</option>
                      {SLOTS.filter(s => !s.isBreak).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate(event.id, day, formData)}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <Move size={16} /> Confirm Shift
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};