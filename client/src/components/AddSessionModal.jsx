import React from 'react';
import { Plus, Calendar as CalendarIcon } from "lucide-react";

const AddSessionModal = ({ show, onClose, selectedCell, slots, onAdd }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-[#8B0000] p-8 text-white">
          <h3 className="text-2xl font-black tracking-tight">Assign Session</h3>
          <p className="text-xs font-bold opacity-70 uppercase mt-2 tracking-widest text-left">
            {selectedCell.day} • {slots.find(t => t.id === selectedCell.slotId)?.label}
          </p>
        </div>
        <div className="p-8 space-y-3">
          <button onClick={() => onAdd('today')} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-[#8B0000] hover:text-white rounded-2xl group transition-all text-left">
            <div>
              <span className="block font-black text-sm uppercase">Assign for Today</span>
              <span className="text-[10px] font-bold opacity-60">Temporary schedule change</span>
            </div>
            <Plus className="group-hover:rotate-90 transition-transform" />
          </button>
          <button onClick={() => onAdd('semester')} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-[#8B0000] hover:text-white rounded-2xl group transition-all text-left">
            <div>
              <span className="block font-black text-sm uppercase">Assign for Complete Sem</span>
              <span className="text-[10px] font-bold opacity-60">Permanent timetable update</span>
            </div>
            <CalendarIcon size={20} />
          </button>
          <button onClick={onClose} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest mt-4">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal;