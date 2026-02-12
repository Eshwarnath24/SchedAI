import React, { useEffect, useState } from 'react';
import { Menu, X, FileText, ChevronRight, AlertCircle, Trash2, Edit2, RotateCcw } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const readLocal = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const LeaveForm = ({ activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [editingId, setEditingId] = useState(null);

  // History State - Initialized as empty or from LocalStorage
  const [leaveHistory, setLeaveHistory] = useState(() => readLocal('facultyLeaveHistory', []));

  useEffect(() => writeLocal('facultyLeaveHistory', leaveHistory), [leaveHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;
    if (new Date(toDate) < new Date(fromDate)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (editingId) {
        // Update existing request
        setLeaveHistory(prev => prev.map(leave =>
          leave.id === editingId
            ? {
              ...leave,
              appliedDate: new Date().toISOString().split('T')[0], // Update applied date on edit? Or keep original? Let's update.
              type: leaveType,
              duration: `${fromDate === toDate ? fromDate : fromDate + ' - ' + toDate}`,
              reason: reason // Save reason too if we were storing it, but structure only has type/duration/status/date. Let's stick to structure.
              // Actually, the previous structure didn't store 'reason' in the object in the array, only displayed type/duration. 
              // We should probably store it if we want to edit it back.
              // For now, consistent with previous code, we reconstruct the object.
            }
            : leave
        ));
        setEditingId(null);
      } else {
        // Create new request
        const newRequest = {
          id: Date.now(),
          appliedDate: new Date().toISOString().split('T')[0],
          type: leaveType,
          duration: `${fromDate === toDate ? fromDate : fromDate + ' - ' + toDate}`,
          status: 'Pending'
        };
        setLeaveHistory(prev => [newRequest, ...prev]);
      }

      setFromDate('');
      setToDate('');
      setReason('');
      setLeaveType('Casual Leave');
      setIsSubmitting(false);
    }, 800);
  };

  const handleEdit = (leave) => {
    setEditingId(leave.id);
    // Parse duration back to dates
    if (leave.duration.includes(' - ')) {
      const [start, end] = leave.duration.split(' - ');
      setFromDate(start);
      setToDate(end);
    } else {
      setFromDate(leave.duration);
      setToDate(leave.duration);
    }
    setLeaveType(leave.type);
    setReason(''); // We don't store reason in history currently, so can't populate it.

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      setLeaveHistory(prev => prev.filter(l => l.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFromDate('');
        setToDate('');
        setReason('');
        setLeaveType('Casual Leave');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFromDate('');
    setToDate('');
    setReason('');
    setLeaveType('Casual Leave');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit whitespace-nowrap">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit whitespace-nowrap">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit whitespace-nowrap">Pending</span>;
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#F8FAFC] overflow-hidden font-sans relative">
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
        <Sidebar onClose={() => setIsSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
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
          {/* Title Section */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Leave Application</h1>
            <p className="text-slate-500 mt-2 text-lg">Submit a leave request for HOD approval.</p>
          </div>

          <div className={`grid grid-cols-1 ${leaveHistory.length > 0 ? 'xl:grid-cols-12' : 'max-w-xl mx-auto'} gap-8 items-start pb-10 transition-all duration-500`}>
            {/* Form Section */}
            <div className={leaveHistory.length > 0 ? 'xl:col-span-5' : 'w-full'}>
              <div className={`bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 transition-all ${editingId ? 'ring-2 ring-amber-400/50' : ''}`}>
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Edit2 className="text-amber-500" size={18} />
                      Edit Request
                    </>
                  ) : (
                    <>
                      <FileText className="text-[#8B0000]" size={18} />
                      New Request
                    </>
                  )}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">From Date</label>
                      <input
                        type="date" required value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                        className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">To Date</label>
                      <input
                        type="date" required value={toDate} onChange={(e) => setToDate(e.target.value)}
                        className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Leave Type</label>
                    <div className="relative">
                      <select
                        value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] outline-none transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option>Casual Leave</option>
                        <option>Sick Leave</option>
                        <option>On Duty (OD)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Reason</label>
                    <textarea
                      required value={reason} onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly explain the reason for your leave..."
                      className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {fromDate && toDate && new Date(toDate) < new Date(fromDate) && (
                    <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <AlertCircle size={14} />
                      <span>Invalid date range selection</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {editingId && (
                      <button
                        type="button" onClick={handleCancelEdit}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit" disabled={isSubmitting}
                      className={`flex-[2] py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-4
                          ${isSubmitting ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#700000] text-white active:scale-[0.98] shadow-[#8B0000]/20'}
                        `}
                    >
                      {isSubmitting ? 'Saving...' : (editingId ? 'Update Request' : 'Submit Request')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* History Section - Hidden if history length is 0 */}
            {leaveHistory.length > 0 ? (
              <div className="xl:col-span-7 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">My Leave History</h2>
                    <span className="text-[10px] bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-bold uppercase tracking-wider">Recent</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="bg-slate-50/30">
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Applied</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {leaveHistory.map((leave) => (
                          <tr key={leave.id} className={`hover:bg-slate-50/20 transition-colors ${editingId === leave.id ? 'bg-amber-50/40' : ''}`}>
                            <td className="p-4 text-xs text-slate-500 font-medium">
                              {leave.appliedDate}
                            </td>
                            <td className="p-4 text-sm text-slate-800 font-bold">{leave.type}</td>
                            <td className="p-4 text-xs text-slate-600">{leave.duration}</td>
                            <td className="p-4">
                              {getStatusBadge(leave.status)}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEdit(leave)}
                                  className={`p-2 rounded-lg transition-colors ${editingId === leave.id ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                  title="Edit Request"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(leave.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Request"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 px-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending Review
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Approved by HOD
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Request Rejected
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaveForm;
