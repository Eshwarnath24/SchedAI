import React, { useState } from "react";
import { X } from "lucide-react";
import { TEACHER_COURSES, ACADEMIC_YEARS, SECTIONS, ROOMS } from "../utils/constants";

export const AddEventModal = ({ isOpen, onClose, onSubmit, day, slotId }) => {
  const [formData, setFormData] = useState({
    year: '3rd Year',
    courseId: '',
    room: '',
    section: 'A',
    type: 'Theory',
    scope: 'Today'
  });

  const filteredCourses = TEACHER_COURSES.filter(c => c.years.includes(formData.year));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const courseDetail = TEACHER_COURSES.find(c => c.id === formData.courseId);
    if (!courseDetail) return;
    onSubmit({ id: Math.random().toString(36), slotId, ...formData, code: formData.courseId, title: courseDetail.title });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-[#8B0000] p-8 text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black">Assign Schedule</h3>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-2">{day} • Slot {slotId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1">Apply For</label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {['Today', 'Complete Sem'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, scope: s })}
                  className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${formData.scope === s ? 'bg-white text-[#8B0000] shadow-sm' : 'text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Academic Year</label>
              <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value, courseId: ''})} className="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-[#8B0000]/5">{ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Section</label>
              <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-[#8B0000]/5">{SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}</select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Course</label>
            <select required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-[#8B0000]/5"><option value="">Select Course...</option>{filteredCourses.map(c => <option key={c.id} value={c.id}>{c.id} - {c.title}</option>)}</select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Room</label>
              <select required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-[#8B0000]/5">
                <option value="">Select Room...</option>
                {ROOMS.filter(room => room.type === formData.type).map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, room: ''})} className="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-[#8B0000]/5"><option>Theory</option> <option>Lab</option> <option>Review</option></select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-5 bg-[#8B0000] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-900/20 active:scale-95 transition-all">Save Slot</button>
          </div>
        </form>
      </div>
    </div>
  );
};