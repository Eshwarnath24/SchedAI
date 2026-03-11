import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BookOpen, Clock, Briefcase, Calendar, UserCheck, Menu, Layout, Printer, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Sidebar from '../../components/Sidebar';
import WorkloadReportModal from '../../components/WorkloadReportModal';
import { buildFacultyActivityReport } from '../../utils/generateReports';
import { buildCompletedEntries, buildChartData, calculateTotals } from '../../utils/workloadPageUtils';
import { fetchFacultyWorkloadReport } from '../../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-rose-100 shadow-xl rounded-xl text-sm min-w-[180px] z-50">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">
          {label}
        </p>

        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-gray-600 capitalize text-xs font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-gray-900">
                {entry.value}h
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="text-gray-500 text-xs font-bold uppercase">
            Total
          </span>
          <span className="font-extrabold text-rose-950 text-base">
            {payload.reduce((a, b) => a + b.value, 0)} hrs
          </span>
        </div>
      </div>
    );
  }

  return null;
};

const StatCard = ({ icon: Icon, label, value, colorClass, iconColorClass }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300 flex items-center gap-4 relative overflow-hidden group">
    <div
      className={`absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${iconColorClass.replace(
        'text-',
        'bg-'
      )}`}
    ></div>

    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass} ${iconColorClass}`}
    >
      {Icon && <Icon size={24} strokeWidth={2} />}
    </div>

    <div className="relative z-10">
      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-extrabold text-gray-800 leading-none">
        {value}
      </p>
    </div>
  </div>
);

// Memoized Chart Component to improve rendering performance
const WorkloadChart = React.memo(({ chartData }) => {
  // Validate chart data
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] w-full min-w-0 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm font-medium">No workload data available</p>
          <p className="text-xs mt-1">Check if you have any classes assigned in the schedule</p>
        </div>
      </div>
    );
  }

  // Check if all data is zeros
  const hasNonZeroData = chartData.some(day => 
    (day.theory > 0) || (day.lab > 0) || (day.admin > 0)
  );

  if (!hasNonZeroData) {
    return (
      <div className="h-[300px] sm:h-[400px] w-full min-w-0 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-300" />
          <p className="text-sm font-medium">No classes scheduled this week</p>
          <p className="text-xs mt-1">Your workload data shows 0 hours across all days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] sm:h-[400px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#6b7280',
              fontSize: 12,
              fontWeight: 600,
            }}
            dy={10}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
          />
          <Bar
            dataKey="theory"
            stackId="a"
            fill="#A6192E"
            name="Theory"
            radius={[0, 0, 4, 4]}
            maxBarSize={40}
            isAnimationActive={true}
          />
          <Bar
            dataKey="lab"
            stackId="a"
            fill="#F2A900"
            name="Lab"
            radius={[0, 0, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
          />
          <Bar
            dataKey="admin"
            stackId="a"
            fill="#555555"
            name="Admin"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

WorkloadChart.displayName = 'WorkloadChart';

// --- MAIN PAGE ---

export default function WorkloadPage() {
  const { events, currentTeacher, loggedInUser } = useContext(AppContext);

  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Odd');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Real-time workload data state
  const [workloadData, setWorkloadData] = useState(null);
  const [workloadLoading, setWorkloadLoading] = useState(true);
  const [workloadError, setWorkloadError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const teacherName = currentTeacher?.name || 'Faculty Member';
  const teacherDept = currentTeacher?.department || 'General Studies';
  const teacherId = loggedInUser?._id || currentTeacher?.id || 'ID-000';

  // Fetch real-time workload data
  const loadWorkloadData = useCallback(async (forceRefresh = false) => {
    if (!loggedInUser?._id) {
      console.warn('[Workload] No faculty ID available yet');
      setWorkloadLoading(false);
      return;
    }

    // Skip if already loaded and not forcing refresh
    if (workloadData && !forceRefresh) {
      return;
    }

    try {
      setWorkloadLoading(true);
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      const data = await fetchFacultyWorkloadReport(loggedInUser._id, forceRefresh);
      
      if (data.success) {
        setWorkloadData(data);
        setWorkloadError(null);
        setLastUpdated(new Date());
      } else {
        setWorkloadError('Failed to load workload data');
      }
    } catch (error) {
      console.error('[Workload] Error loading workload data:', error);
      setWorkloadError(error.message);
    } finally {
      setWorkloadLoading(false);
      setIsRefreshing(false);
    }
  }, [loggedInUser, workloadData]);

  useEffect(() => {
    loadWorkloadData();
  }, [loadWorkloadData]);

  // Manual refresh handler
  const handleRefresh = () => {
    loadWorkloadData(true);
  };

  // Legacy data for fallback (kept for backward compatibility)
  const facultyReport = useMemo(() => {
    return buildFacultyActivityReport({
      facultyId: currentTeacher?.id || 'FAC-001',
      facultyName: currentTeacher?.name || 'Faculty Member',
      events: events || {},
      assignedCourses: currentTeacher?.courses || [],
      maxWeeklyHours: 25,
    });
  }, [events, currentTeacher]);

  const completedEntries = useMemo(
    () => buildCompletedEntries(facultyReport),
    [facultyReport]
  );

  // Filter chart data to show only up to the current day of the week
  const DAY_ORDER = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], []);
  const todayIndex = useMemo(() => {
    const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    if (jsDay === 0 || jsDay === 6) return 4; // Weekend → show full week
    return jsDay - 1; // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4
  }, []);

  // Use real-time data if available, otherwise fallback to legacy — filtered up to today
  const chartData = useMemo(() => {
    let fullWeekData;

    if (workloadData?.chartReadyData && Array.isArray(workloadData.chartReadyData) && workloadData.chartReadyData.length > 0) {
      fullWeekData = workloadData.chartReadyData;
    } else if (workloadData?.weeklyDistribution && Array.isArray(workloadData.weeklyDistribution) && workloadData.weeklyDistribution.length > 0) {
      fullWeekData = workloadData.weeklyDistribution.map(day => ({
        name: day.dayShort || day.day?.substring(0, 3) || '???',
        theory: Number(day.Theory) || 0,
        lab: Number(day.Lab) || 0,
        admin: Number(day.CIR) || Number(day.Admin) || 0
      }));
    } else {
      fullWeekData = buildChartData(facultyReport);
    }

    // Show all days — past/today have real data, future days are zeroed out
    return fullWeekData.map(day => {
      const idx = DAY_ORDER.indexOf(day.name);
      if (idx !== -1 && idx <= todayIndex) return day;
      return { name: day.name, theory: 0, lab: 0, admin: 0 };
    });
  }, [workloadData, facultyReport, todayIndex, DAY_ORDER]);

  // Determine if using live data
  const usingLiveData = workloadData && 
                        (workloadData.chartReadyData?.length > 0 || workloadData.weeklyDistribution?.length > 0);

  // Calculate totals from filtered chart data (only up to current day)
  const { totalTheory, totalLab, totalAdmin, totalHours } = useMemo(() => {
    if (chartData && chartData.length > 0) {
      const theory = chartData.reduce((sum, d) => sum + (d.theory || 0), 0);
      const lab = chartData.reduce((sum, d) => sum + (d.lab || 0), 0);
      const admin = chartData.reduce((sum, d) => sum + (d.admin || 0), 0);
      return { totalTheory: theory, totalLab: lab, totalAdmin: admin, totalHours: theory + lab + admin };
    }
    return calculateTotals(completedEntries);
  }, [chartData, completedEntries]);

  const currentDayLabel = DAY_ORDER[todayIndex];

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden print:hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform print:hidden
          ${
            isSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto w-full relative print:overflow-visible print:h-auto">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800">Amrita</span>
              <span className="text-[10px] text-slate-500">
                {teacherDept}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {workloadLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#8B0000] animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading workload data...</p>
            </div>
          </div>
        )}

        {workloadError && !workloadLoading && (
          <div className="p-4 m-8 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="font-bold text-red-800">Failed to load workload data</p>
                <p className="text-sm text-red-600">{workloadError}</p>
                <p className="text-xs text-red-500 mt-2">Falling back to cached data...</p>
              </div>
            </div>
          </div>
        )}

        {!workloadLoading && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                My Workload Report
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                Live data from active schedule • Analysis of your daily and weekly teaching distribution
              </p>
              {lastUpdated && (
                <p className="text-gray-400 text-[10px] mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 15 seconds
                </p>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto print:hidden">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all whitespace-nowrap ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button 
                onClick={() => setShowPrintModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-950 rounded-lg hover:bg-rose-900 shadow-md shadow-rose-900/20 transition-all whitespace-nowrap"
              >
                <Printer size={16} />
                <span className="inline">Print</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-2 sm:p-1.5 mb-8">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 bg-rose-50/50 rounded-xl border border-rose-100 px-4 sm:px-5 py-2.5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-rose-900/60 uppercase tracking-wider">
                  Faculty Profile
                </span>

                <div className="flex items-center gap-2 mt-0.5">
                  <UserCheck size={16} className="text-rose-900" />
                  <span className="font-bold text-gray-800 text-sm truncate">
                    {teacherName}
                  </span>
                </div>
              </div>

              <div className="flex-[2] flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex flex-col justify-center hover:border-gray-300 transition-colors">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
                    Academic Year
                    {usingLiveData && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[8px] font-black uppercase">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-sm text-gray-700">{academicYear}</span>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex flex-col justify-center hover:border-gray-300 transition-colors">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Semester
                  </label>

                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-sm text-gray-700">{semester}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            <StatCard
              icon={Clock}
              label="Total Weekly Load"
              value={`${totalHours} Hrs`}
              colorClass="bg-rose-50"
              iconColorClass="text-rose-900"
            />
            <StatCard
              icon={BookOpen}
              label="Theory Sessions"
              value={`${totalTheory} Hrs`}
              colorClass="bg-red-50"
              iconColorClass="text-[#A6192E]"
            />
            <StatCard
              icon={Layout}
              label="Lab / Practical"
              value={`${totalLab} Hrs`}
              colorClass="bg-amber-50"
              iconColorClass="text-[#F2A900]"
            />
            <StatCard
              icon={Briefcase}
              label="Admin / Research"
              value={`${totalAdmin} Hrs`}
              colorClass="bg-gray-100"
              iconColorClass="text-gray-600"
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-6 md:p-8 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Your Schedule Distribution
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  Mon – Fri • Updated through {currentDayLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A6192E]"></span>
                  Theory
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F2A900]"></span>
                  Lab
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#555555]"></span>
                  Admin
                </div>
              </div>
            </div>

            <WorkloadChart chartData={chartData} />
          </div>
        </div>
        )}

        <footer className="bg-white border-t border-gray-100 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
            <p className="text-center md:text-left">
              Amrita Vishwa Vidyapeetham • University Management System
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <span className="hover:text-rose-900 cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-rose-900 cursor-pointer transition-colors">
                Support
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>v3.0.1 (M3-Module)</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
      <WorkloadReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        stats={{ totalHours, totalTheory, totalLab, totalAdmin }}
        chartData={chartData}
        entries={completedEntries}
        teacher={currentTeacher || {}}
      />
    </>
  );
}
