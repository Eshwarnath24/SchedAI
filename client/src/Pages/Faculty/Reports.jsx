import React, { useState, useContext } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle,
  Coffee,
  Download,
  Eye,
  MapPin,
  Menu,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX,
} from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import ExportReportModal from '../../components/ExportReportModal';
import Logo from '../../components/Logo';
import { buildFacultyActivityReport } from '../../utils/generateReports';
import { prepareFacultyReportInput } from '../../utils/reportData';
import { DAYS } from '../../utils/constants';
import {
  getEntryBadgeType,
  buildFreeSlotInsight,
  buildLocationSummary,
  buildEngagementStats,
  buildLeaveImpacts,
} from '../../utils/reportPageUtils';

const Badge = ({ children, type }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border border-rose-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

const ReportsPage = ({ user, events, announcementsList }) => {
  const [activeSubTab, setActiveSubTab] = useState('schedule');
  const [showExportModal, setShowExportModal] = useState(false);

  // Derive report data using utilities
  const reportInput = prepareFacultyReportInput(events, user);
  const report = buildFacultyActivityReport(reportInput);

  // Get today's classes
  const todayName = DAYS[new Date().getDay() - 1] || "Monday";
  const todayClasses = report.byDay[todayName] || [];

  // Overview Stats
  const stats = {
    todayCount: todayClasses.filter(c => c.isTeaching).length,
    extraCount: report.totalExtraHours,
    subsCount: report.totalSubstituteHours,
    alertsCount: announcementsList?.filter(a => a.type === 'urgent').length || 0
  };

  const extraEntries = report.entries.filter(entry => entry.classType === 'Extra');
  const cancelledEntries = report.entries.filter(entry => entry.status === 'Cancelled');
  const substituteEntries = report.entries.filter(entry => entry.classType === 'Substitute');
  const changeLogEntries = report.entries.filter(entry => entry.status === 'Cancelled' || entry.classType === 'Extra' || entry.classType === 'Substitute');

  const todayLabel = new Date().toLocaleDateString();
  const freeSlotInsight = buildFreeSlotInsight(todayClasses);
  const locationSummaryItems = buildLocationSummary(todayClasses);
  const engagementStats = buildEngagementStats(report, extraEntries);
  const leaveImpacts = buildLeaveImpacts(cancelledEntries);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-rose-900" size={28} />
              Reports & Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1 ml-9">Track your schedule changes, substitutions, and activity logs.</p>
          </div>
          <div className="flex gap-3 ml-auto md:ml-0">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-900 text-white rounded-lg text-sm hover:bg-rose-800 transition-colors shadow-sm"
              >
                <Download size={16} /> Export Reports
              </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CalendarDays size={24}/></div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today</p>
                 <p className="text-xl font-bold text-slate-900">{stats.todayCount} Classes</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24}/></div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Extra</p>
                 <p className="text-xl font-bold text-slate-900">{stats.extraCount} Hours</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={24}/></div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Subs</p>
                 <p className="text-xl font-bold text-slate-900">{stats.subsCount} Active</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-rose-200 transition-colors">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Bell size={24}/></div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Alerts</p>
                 <p className="text-xl font-bold text-slate-900">{stats.alertsCount} New</p>
              </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] overflow-hidden">
          <div className="border-b border-slate-200 px-6 pt-2 overflow-x-auto">
              <nav className="flex space-x-8 min-w-max">
              <button onClick={() => setActiveSubTab('schedule')} className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'schedule' ? 'border-rose-900 text-rose-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Schedule</button>
              <button onClick={() => setActiveSubTab('changes')} className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'changes' ? 'border-rose-900 text-rose-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Changes & Exceptions</button>
              <button onClick={() => setActiveSubTab('personal')} className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'personal' ? 'border-rose-900 text-rose-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Leaves & Subs</button>
              <button onClick={() => setActiveSubTab('notifications')} className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'notifications' ? 'border-rose-900 text-rose-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>History & Alerts</button>
              </nav>
          </div>

          <div className="p-6">
              {activeSubTab === 'schedule' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                      <div>
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-slate-800">Daily Activity Report</h3>
                            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{todayLabel}</span>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                                  <tr>
                                      <th className="px-6 py-4">Time</th>
                                      <th className="px-6 py-4">Activity</th>
                                      <th className="px-6 py-4">Type</th>
                                      <th className="px-6 py-4">Room / Location</th>
                                      <th className="px-6 py-4">Status</th>
                                  </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {todayClasses.map((item, idx) => (
                                      <tr
                                      key={item.id || idx}
                                      className={item.isTeaching ? 'hover:bg-slate-50' : 'bg-slate-50/40 text-slate-400'}
                                      >
                                      <td className="px-6 py-4 font-medium">{item.timeStart} - {item.timeEnd}</td>
                                      <td className="px-6 py-4">{item.courseName || item.courseCode || item.activity || 'Scheduled Block'}</td>
                                      <td className="px-6 py-4">
                                        <Badge type={getEntryBadgeType(item)}>{item.classType || (item.isTeaching ? 'Teaching' : 'Activity')}</Badge>
                                      </td>
                                      <td className="px-6 py-4 flex items-center gap-2">
                                        {item.room && <MapPin size={16} className="text-slate-400"/>}
                                        {item.room || 'TBD'}
                                      </td>
                                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{item.status || 'Scheduled'}</td>
                                      </tr>
                                    ))}
                                  {todayClasses.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic font-medium">No activity scheduled for today.</td></tr>
                                  )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Coffee size={18} className="text-amber-600"/> Free Slot Insights</h4>
                              {freeSlotInsight ? (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  You have <span className="font-bold text-slate-800">{freeSlotInsight.durationLabel}</span> free between
                                  {' '}
                                  <span className="font-bold text-slate-800">{freeSlotInsight.rangeLabel}</span>. {freeSlotInsight.suggestion}
                                </p>
                              ) : (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  Sessions run back-to-back today. Consider requesting support if you need a recovery window.
                                </p>
                              )}
                          </div>
                          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><MapPin size={18} className="text-rose-600"/> Location Summary</h4>
                              {locationSummaryItems.length > 0 ? (
                                <ul className="text-sm text-slate-600 space-y-2">
                                  {locationSummaryItems.map(item => (
                                    <li key={item.id} className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                      <span className="font-semibold text-slate-800">{item.label}:</span>
                                      <span className="text-slate-600">{item.rooms}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-600">Room allocations will appear here once sessions are scheduled.</p>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {activeSubTab === 'changes' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-emerald-600"/> Extra Classes</h3>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-emerald-50 text-emerald-800 font-semibold">
                                  <tr><th className="px-6 py-4">Date/Day</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Room</th><th className="px-6 py-4">Status</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                  {extraEntries.map((cls, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-bold uppercase text-xs">{cls.day}</td>
                                      <td className="px-6 py-4">{cls.timeStart} - {cls.timeEnd}</td>
                                      <td className="px-6 py-4 font-medium text-slate-900">{cls.courseName}</td>
                                      <td className="px-6 py-4">{cls.room}</td>
                                      <td className="px-6 py-4 text-slate-500">Confirmed</td>
                                      </tr>
                                  ))}
                                  {extraEntries.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic font-medium">No extra classes recorded this week.</td></tr>
                                  )}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><UserX size={20} className="text-rose-600"/> Cancelled & Rescheduled</h3>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-rose-50 text-rose-800 font-semibold">
                                  <tr><th className="px-6 py-4">Day</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Reason</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                  {cancelledEntries.map((cls, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 font-bold uppercase text-xs">{cls.day}</td>
                                      <td className="px-6 py-4">{cls.timeStart} - {cls.timeEnd}</td>
                                      <td className="px-6 py-4 font-medium text-slate-900">{cls.courseName}</td>
                                      <td className="px-6 py-4"><Badge type="danger">Cancelled</Badge></td>
                                      <td className="px-6 py-4 text-slate-500">{cls.reason || 'Schedule change logged'}</td>
                                      </tr>
                                  ))}
                                  {cancelledEntries.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic font-medium">No cancellations recorded this week.</td></tr>
                                  )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

              {activeSubTab === 'personal' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><RefreshCw size={20} className="text-amber-500"/> Substitution Report</h3>
                              <div className="overflow-hidden rounded-xl border border-slate-200">
                                  <table className="w-full text-sm text-left">
                                      <thead className="bg-amber-50 text-amber-800 font-semibold">
                                      <tr><th className="px-6 py-4">Day</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Activity</th></tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 bg-white">
                                      {substituteEntries.map((sub, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 font-bold uppercase text-xs">{sub.day}</td>
                                          <td className="px-6 py-4 font-medium">{sub.courseName}</td>
                                          <td className="px-6 py-4 text-slate-600">Lecture ({sub.timeStart})</td>
                                          </tr>
                                      ))}
                                      {substituteEntries.length === 0 && (
                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 italic font-medium">No substitutions performed this week.</td></tr>
                                      )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><UserX size={20} className="text-slate-500"/> Engagement Analysis</h3>
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                  {engagementStats.length > 0 ? (
                                    <ul className="space-y-4">
                                      {engagementStats.map(stat => (
                                        <li key={stat.label} className="flex justify-between items-center pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                                          <div>
                                              <p className="font-semibold text-slate-800">{stat.label}</p>
                                              <p className="text-xs text-slate-500 mt-1">{stat.detail}</p>
                                          </div>
                                          <span className={`text-sm font-bold italic ${stat.accent || 'text-emerald-600'}`}>{stat.value}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-slate-600">Engagement metrics will populate when timetable data is available.</p>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-rose-500"/> Leave Impact Analysis</h3>
                          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                              {leaveImpacts.length > 0 ? (
                                <div className="space-y-3">
                                  {leaveImpacts.map(item => (
                                    <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                                      <span className="font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{item.timeRange}</span>
                                      <div className="flex-1">
                                        <p className="font-bold text-slate-800">{item.courseName}</p>
                                        {item.section && <p className="text-xs text-slate-500 mt-0.5">Section {item.section}</p>}
                                      </div>
                                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">{item.reason}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-600">No cancellations or leave impacts recorded this week.</p>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {activeSubTab === 'notifications' && (
                  <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Eye size={20} className="text-slate-600"/> Change History Log</h3>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                              <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                                  <tr><th className="px-4 py-3">Date/Day</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Context</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                  {changeLogEntries.slice(0, 8).map((hist, i) => (
                                      <tr key={i}>
                                          <td className="px-4 py-3 text-slate-500 font-bold uppercase">{hist.day}</td>
                                          <td className="px-4 py-3">
                                              <div className="flex flex-col gap-1">
                                                  <span className="text-slate-900 font-bold">{hist.courseName}</span>
                                                  <span className="text-slate-500 text-[10px]">{hist.timeStart}</span>
                                              </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                              hist.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                              {hist.status || hist.classType}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 font-medium text-slate-800">{hist.room}</td>
                                      </tr>
                                  ))}
                                  {changeLogEntries.length === 0 && (
                                    <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400 italic">No historical changes recorded.</td></tr>
                                  )}
                                  </tbody>
                              </table>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-slate-100">
                              <h4 className="text-sm font-bold text-slate-700 mb-3">Schedule Publish History</h4>
                              <ul className="text-xs text-slate-500 space-y-2">
                                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Semester 2 Final Draft (Published Yesterday)</li>
                                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Semester 1 Review 3 (Published 1 month ago)</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
      
      {/* Export Preview Modal */}
      <ExportReportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        user={user}
        report={report}
      />
    </>
  );
};

export default function Reports() {
  const { currentTeacher, events, announcementsList } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
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
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <Logo className="w-8 h-8 md:w-10 md:h-10 text-[#8B0000]" showText={false} />
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <ReportsPage 
            user={currentTeacher} 
            events={events} 
            announcementsList={announcementsList} 
          />
        </main>
      </div>
    </div>
  );
}