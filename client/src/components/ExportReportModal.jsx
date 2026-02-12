import React, { useState } from 'react';
import { X, RefreshCw, Download, TrendingUp, UserX } from 'lucide-react';

const SimpleBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-4 h-32 w-full mt-4 border-b border-slate-200 pb-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center justify-end group">
          <div className="text-[10px] font-bold text-slate-500 mb-1">{item.value}h</div>
          <div
            className={`w-full rounded-t-sm transition-all ${item.color || 'bg-slate-300'}`}
            style={{ height: `${(item.value / maxVal) * 100}%` }}
          ></div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium text-center truncate w-full">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

const SimpleDonutChart = ({ percent, label, color }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className={color}
            strokeDasharray={`${percent}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-sm font-bold ${color.replace('text-', 'text-slate-800')}`}>{percent}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wide">{label}</span>
    </div>
  );
};

const ExportReportModal = ({ isOpen, onClose, user, report }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !report) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 2000);
  };

  const activityData = [
    { label: 'Theory', value: report.totalTheoryHours, color: 'bg-blue-500' },
    { label: 'Lab', value: report.totalLabHours, color: 'bg-purple-500' },
    { label: 'Extra', value: report.totalExtraHours, color: 'bg-emerald-500' },
    { label: 'Substitute', value: report.totalSubstituteHours, color: 'bg-amber-500' },
  ].filter((d) => d.value > 0);

  if (activityData.length === 0) {
    activityData.push({ label: 'Basic', value: report.totalTeachingHours || 1, color: 'bg-slate-300' });
  }

  const changesPercent = Math.round(
    (report.totalCancelledHours / (report.totalTeachingHours + report.totalCancelledHours || 1)) * 100
  );
  const attendancePercent = Math.round((report.totalCompletedHours / (report.totalTeachingHours || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
          <h3 className="text-lg font-bold text-slate-900">Comprehensive Report Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        
        {/* Preview Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
          <div className="bg-white shadow-sm border border-slate-200 p-10 min-h-[400px] mx-auto max-w-2xl">
            {/* Document Header */}
            <div className="text-center mb-8 border-b-2 border-slate-100 pb-6">
              <div className="w-12 h-12 bg-rose-900 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm mx-auto mb-3">A</div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Amrita Vishwa Vidyapeetham</h1>
              <p className="text-xs text-slate-500 font-bold tracking-wider mt-1">{(user?.department || 'CSE').toUpperCase()} DEPARTMENT</p>
            </div>
            
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Faculty Performance & Schedule Report</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Generated for: <span className="font-semibold text-slate-700">{user?.name || 'Dr. Robert Fox'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">ID: {user?.id || 'FAC-2024-001'}</p>
              </div>
            </div>

            <div className="text-slate-800 space-y-10">
              {/* Section 1: Executive Summary */}
              <section>
                <h3 className="font-bold text-rose-900 mb-4 border-b border-rose-100 pb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                  1. Executive Summary
                </h3>
                <div className="flex gap-8 items-center justify-between bg-slate-50 p-6 rounded-lg border border-slate-100">
                  <div className="w-1/2">
                    <h4 className="text-xs font-bold text-slate-600 mb-2 uppercase text-center">Daily Activity Distribution</h4>
                    <SimpleBarChart data={activityData} />
                  </div>
                  <div className="w-px h-24 bg-slate-200"></div>
                  <div className="flex gap-6 w-1/2 justify-center">
                    <SimpleDonutChart percent={changesPercent} label="Schedule Variance" color="text-rose-500" />
                    <SimpleDonutChart percent={attendancePercent} label="Schedule Adherence" color="text-emerald-500" />
                  </div>
                </div>
              </section>

              {/* Section 2: Daily Schedule */}
              <section>
                <h3 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                  2. Weekly Schedule Activity
                </h3>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 border-b">Day</th>
                      <th className="p-2 border-b">Time</th>
                      <th className="p-2 border-b">Activity</th>
                      <th className="p-2 border-b">Type</th>
                      <th className="p-2 border-b">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.entries.slice(0, 15).map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 border-b border-slate-50 font-bold uppercase text-[10px]">{item.day}</td>
                        <td className="p-2 border-b border-slate-50 font-mono text-slate-600">{item.timeStart} - {item.timeEnd}</td>
                        <td className="p-2 border-b border-slate-50 font-bold text-slate-800">{item.courseName || item.activity}</td>
                        <td className="p-2 border-b border-slate-50">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500">{item.classType}</span>
                        </td>
                        <td className="p-2 border-b border-slate-50 text-slate-600">{item.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Section 3: Changes & Exceptions */}
              <section>
                <h3 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                  3. Schedule Changes & Exceptions
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp size={12} /> Extra Classes
                    </h4>
                    <div className="border border-slate-100 rounded bg-emerald-50/30 p-2">
                      <table className="w-full text-xs text-left">
                        <tbody>
                          {report.entries.filter((e) => e.classType === 'Extra').length > 0
                            ? report.entries
                                .filter((e) => e.classType === 'Extra')
                                .map((item, i) => (
                                  <tr key={i} className="border-b border-emerald-100 last:border-0">
                                    <td className="p-1.5 font-semibold text-[10px]">{item.day}, {item.timeStart}</td>
                                    <td className="p-1.5 text-slate-600 truncate">{item.courseName}</td>
                                  </tr>
                                ))
                            : (
                              <tr>
                                <td className="p-2 text-slate-400 italic">No extra classes found</td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-rose-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <UserX size={12} /> Cancelled Classes
                    </h4>
                    <div className="border border-slate-100 rounded bg-rose-50/30 p-2">
                      <table className="w-full text-xs text-left">
                        <tbody>
                          {report.entries.filter((e) => e.status === 'Cancelled').length > 0
                            ? report.entries
                                .filter((e) => e.status === 'Cancelled')
                                .map((item, i) => (
                                  <tr key={i} className="border-b border-rose-100 last:border-0">
                                    <td className="p-1.5 font-semibold text-[10px]">{item.day}, {item.timeStart}</td>
                                    <td className="p-1.5 text-slate-600 truncate">{item.courseName}</td>
                                  </tr>
                                ))
                            : (
                              <tr>
                                <td className="p-2 text-slate-400 italic">No cancellations recorded</td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Personnel */}
              <section>
                <h3 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                  4. Personnel & Subs
                </h3>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Substitution Log</h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 border-b">Day</th>
                        <th className="p-2 border-b">Course</th>
                        <th className="p-2 border-b">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.entries.filter((e) => e.classType === 'Substitute').length > 0
                        ? report.entries
                            .filter((e) => e.classType === 'Substitute')
                            .map((item, i) => (
                              <tr key={i}>
                                <td className="p-2 border-b border-slate-50 text-[10px] uppercase">{item.day}</td>
                                <td className="p-2 border-b border-slate-50 font-bold">{item.courseName}</td>
                                <td className="p-2 border-b border-slate-50 text-slate-600">{item.timeStart} - {item.timeEnd}</td>
                              </tr>
                            ))
                        : (
                          <tr>
                            <td colSpan="3" className="p-3 text-slate-400 text-center italic">No substitution activity this week.</td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Weekly Activity Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-3 rounded border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Total Hours</div>
                        <div className="text-[10px] text-slate-500 uppercase">Teaching</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{report.totalTeachingHours}h</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Extra Classes</div>
                        <div className="text-[10px] text-slate-500 uppercase">Engagement</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{report.totalExtraHours}h</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: History */}
              <section>
                <h3 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                  5. Weekly Overview
                </h3>
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 border-b w-1/4">Type</th>
                      <th className="p-2 border-b w-1/2">Hours</th>
                      <th className="p-2 border-b w-1/4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-b border-slate-50 text-slate-500 uppercase font-bold">Theory</td>
                      <td className="p-2 border-b border-slate-50 font-medium">{report.totalTheoryHours} Hours</td>
                      <td className="p-2 border-b border-slate-50 text-emerald-600 font-bold">Planned</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b border-slate-50 text-slate-500 uppercase font-bold">Lab</td>
                      <td className="p-2 border-b border-slate-50 font-medium">{report.totalLabHours} Hours</td>
                      <td className="p-2 border-b border-slate-50 text-emerald-600 font-bold">Planned</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">This report is system generated by Amrita UMS. Signature not required.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-rose-900 text-white text-sm font-medium rounded-lg hover:bg-rose-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download size={16} /> Download Full Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
