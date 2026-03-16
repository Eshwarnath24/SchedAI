import React, { useEffect, useState, useContext } from 'react';
import { Menu, FileText, ChevronRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Logo from '../../components/Logo';
import { AppContext } from '../../context/AppContext';
import { applyLeaveApi, fetchLeaveHistory } from '../../utils/api';

const LeaveForm = ({ activeTab, setActiveTab }) => {
  const { loggedInUser } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');

  // History State
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Load history from DB on mount
  useEffect(() => {
    if (loggedInUser?._id) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaveHistory(loggedInUser._id);
      setLeaveHistory(data.leaveHistory || []);
    } catch (err) {
      console.error('Failed to load leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;
    if (new Date(toDate) < new Date(fromDate)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await applyLeaveApi({
        facultyId: loggedInUser._id,
        fromDate,
        toDate,
        message: reason,
        leaveType,
      });

      setSubmitSuccess(true);
      setFromDate('');
      setToDate('');
      setReason('');
      setLeaveType('Casual Leave');

      // Reload history
      await loadHistory();

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const getLeaveTypeLabel = (type) => {
    const map = { 'Casual': 'Casual Leave', 'Sick': 'Sick Leave', 'Duty': 'On Duty (OD)' };
    return map[type] || type;
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
            <Logo className="w-8 h-8 md:w-10 md:h-10 text-[#8B0000]" showText={false} />
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
              <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <FileText className="text-[#8B0000]" size={18} />
                  New Request
                </h2>

                {/* Success message */}
                {submitSuccess && (
                  <div className="mb-4 flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <CheckCircle size={16} />
                    <span>Leave request submitted successfully!</span>
                  </div>
                )}

                {/* Error message */}
                {submitError && (
                  <div className="mb-4 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <AlertCircle size={14} />
                    <span>{submitError}</span>
                  </div>
                )}

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

                  <button
                    type="submit" disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-4
                        ${isSubmitting ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#700000] text-white active:scale-[0.98] shadow-[#8B0000]/20'}
                      `}
                  >
                    {isSubmitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* History Section */}
            {loading ? (
              <div className="xl:col-span-7 flex items-center justify-center py-20">
                <Loader2 size={32} className="text-[#8B0000] animate-spin" />
              </div>
            ) : leaveHistory.length > 0 ? (
              <div className="xl:col-span-7 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">My Leave History</h2>
                    <span className="text-[10px] bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-bold uppercase tracking-wider">{leaveHistory.length} records</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="bg-slate-50/30">
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                          <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {leaveHistory.map((leave) => (
                          <tr key={leave._id} className="hover:bg-slate-50/20 transition-colors">
                            <td className="p-4 text-xs text-slate-500 font-medium">
                              {formatDate(leave.createdAt)}
                            </td>
                            <td className="p-4 text-sm text-slate-800 font-bold">{getLeaveTypeLabel(leave.type)}</td>
                            <td className="p-4 text-xs text-slate-600">
                              {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                            </td>
                            <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate">{leave.reason || '—'}</td>
                            <td className="p-4">
                              {getStatusBadge(leave.status)}
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
