import React from 'react';
import { FileText, Printer } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';

const WorkloadReportModal = ({ isOpen, onClose, stats, chartData, entries, teacher }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 print:p-0 print:bg-white print:items-start print:overflow-visible">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none print:animate-none border border-slate-200/50">
        
        {/* Toolbar - Header for Modal (Hidden during print) */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl sticky top-0 z-10 print:hidden backdrop-blur-xl">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-rose-900" />
                    Print Preview
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Review the generated report before printing</p>
            </div>
            
            <div className="flex gap-3">
                <button 
                  onClick={onClose} 
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="px-5 py-2 text-sm font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg flex items-center gap-2 shadow-lg shadow-rose-900/20 transition-all active:scale-95 group"
                >
                  <Printer size={18} className="group-hover:animate-pulse" /> Print Now
                </button>
            </div>
        </div>

        {/* Printable Content - Scrollable Area */}
        <div className="p-8 md:p-12 overflow-y-auto print:p-0 print:overflow-visible bg-white rounded-b-2xl scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* Report Paper Container */}
          <div className="max-w-4xl mx-auto bg-white print:max-w-none">
            
            {/* Official Report Header */}
            <div className="border-b-2 border-slate-900 pb-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-rose-900 text-white flex items-center justify-center font-bold rounded-xl text-3xl shadow-sm">A</div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide leading-tight">Amrita</h1>
                        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide leading-tight">Vishwa Vidyapeetham</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">University Management System</p>
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-md mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Workload Report</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{teacher.name}</p>
                    <p className="text-sm font-medium text-slate-500">{teacher.department || 'Department'}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{teacher.id || 'FAC-ID'} • {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-4 gap-4 mb-10">
                <div className="p-5 border border-rose-100 bg-rose-50/50 rounded-xl">
                  <p className="text-xs font-bold text-rose-800 uppercase mb-1 tracking-wider">Total Workload</p>
                  <p className="text-3xl font-extrabold text-rose-900">{stats.totalHours} <span className="text-sm font-semibold opacity-60">Hrs</span></p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Theory Sessions</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalTheory} <span className="text-xs text-slate-400">Hrs</span></p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Lab / Practical</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalLab} <span className="text-xs text-slate-400">Hrs</span></p>
                </div>
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Admin / Other</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalAdmin} <span className="text-xs text-slate-400">Hrs</span></p>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="mb-10">
                <h4 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Weekly Progression
                </h4>
                <div className="h-64 w-full border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Bar dataKey="theory" stackId="a" fill="#A6192E" name="Theory" barSize={40} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="lab" stackId="a" fill="#F2A900" name="Lab" barSize={40} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="admin" stackId="a" fill="#555555" name="Admin" barSize={40} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Entries Table */}
            <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>Completed Activity Log</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-mono">Week {new Date().toLocaleDateString(undefined, { weekAccent: 'numeric' })}</span>
                </h4>
                
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-3 pr-4 font-bold text-slate-400 uppercase w-24 tracking-wider">Day</th>
                      <th className="py-3 pr-4 font-bold text-slate-400 uppercase w-32 tracking-wider">Time</th>
                      <th className="py-3 pr-4 font-bold text-slate-400 uppercase tracking-wider">Activity Context</th>
                      <th className="py-3 pr-4 font-bold text-slate-400 uppercase w-28 tracking-wider">Class Type</th>
                      <th className="py-3 font-bold text-slate-400 uppercase w-16 text-right tracking-wider">Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.length > 0 ? (
                      entries.map((entry, idx) => (
                        <tr key={idx} className="break-inside-avoid hover:bg-slate-50/50">
                          <td className="py-4 pr-4 font-bold text-slate-800">{entry.day}</td>
                          <td className="py-4 pr-4 font-mono text-slate-500 font-medium">{entry.timeStart} - {entry.timeEnd}</td>
                          <td className="py-4 pr-4">
                            <div className="font-bold text-slate-900 text-sm">{entry.courseName || 'Admin Task'}</div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <span className="font-semibold">{entry.room}</span> 
                                {entry.section && <span>• Sec {entry.section}</span>}
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                              entry.classType === 'Theory' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                              entry.classType === 'Lab' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {entry.classType}
                            </span>
                          </td>
                          <td className="py-4 text-slate-800 font-bold text-right text-sm">{entry.hours}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400 italic">
                            No activities marked as completed for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                     <tr>
                        <td colSpan="4" className="py-4 px-4 font-bold text-right text-slate-600 uppercase text-xs tracking-wide">Total Hours Recorded</td>
                        <td className="py-4 px-0 font-extrabold text-right text-rose-900 text-lg">{stats.totalHours}</td>
                     </tr>
                  </tfoot>
                </table>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <span>System Generated Report</span>
                <span>Signature Validated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadReportModal;
