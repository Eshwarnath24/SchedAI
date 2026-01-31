import React from 'react';
import { MoveRight, Trash2 } from "lucide-react";

const ManageSessionModal = ({ show, onClose, session, onDelete }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 bg-slate-900 text-white">
          <h3 className="text-2xl font-black tracking-tight">{session?.code}</h3>
          <p className="text-xs font-bold uppercase mt-2 tracking-widest text-left">{session?.day} • Session Management</p>
        </div>
        <div className="p-8 space-y-3">
          <button className="w-full flex items-center justify-between p-5 bg-blue-50 text-blue-800 rounded-2xl group hover:bg-blue-100 transition-all text-left">
            <div>
              <span className="block font-black text-sm uppercase">Shift Timings</span>
              <span className="text-[10px] font-bold opacity-60">Move this session to another slot</span>
            </div>
            <MoveRight />
          </button>
          <div className="h-px bg-slate-100 my-4" />
          <button onClick={() => onDelete('today')} className="w-full flex items-center justify-between p-5 bg-rose-50 text-rose-800 rounded-2xl hover:bg-rose-100 transition-all font-black uppercase text-sm">
            Cancel for Today <Trash2 size={18} />
          </button>
          <button onClick={() => onDelete('semester')} className="w-full flex items-center justify-between p-5 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black uppercase text-sm">
            Cancel for Semester <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest mt-4 text-center">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ManageSessionModal;