import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Share2, Download, Clock, BookOpen, Users, Award, Menu, X, RefreshCw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ReportKPICard from '../components/ReportKPICard';
import ReportLoadingScreen from '../components/ReportLoadingScreen';
import EngagementCurveChart from '../components/EngagementCurveChart';
import EfficiencyGauge from '../components/EfficiencyGauge';
import AcademicInventoryTable from '../components/AcademicInventoryTable';
import { AppContext } from '../context/AppContext';
import { 
  generateTeacherWorkloadReport, 
  calculateReportMetrics,
  generateChartTimeline,
  getTodayXCoordinate,
  generateEngagementData,
  generateSVGPath
} from '../utils/generateReports';
import { generateDynamicReportData } from '../utils/reportData';

const Reports = () => {
  const { events, currentTeacher } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeReport, setActiveReport] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update current date/time every minute
  useEffect(() => {
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(dateInterval);
  }, []);

  // Initialize report data
  useEffect(() => {
    const timer = setTimeout(() => {
      const dynamicData = generateDynamicReportData(events, currentTeacher);
      const allReports = generateTeacherWorkloadReport(dynamicData);
      const myReport = allReports[0]; // Get first teacher's report
      setActiveReport(myReport);
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [events, currentTeacher]);

  // Auto-refresh report data every 5 minutes
  useEffect(() => {
    if (!loading) {
      const refreshInterval = setInterval(() => {
        const dynamicData = generateDynamicReportData(events, currentTeacher);
        const allReports = generateTeacherWorkloadReport(dynamicData);
        const myReport = allReports[0];
        setActiveReport(myReport);
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [loading, events, currentTeacher]);

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentDate(new Date());
    
    setTimeout(() => {
      const dynamicData = generateDynamicReportData(events, currentTeacher);
      const allReports = generateTeacherWorkloadReport(dynamicData);
      const myReport = allReports[0];
      setActiveReport(myReport);
      setIsRefreshing(false);
    }, 800);
  };

  // Calculate metrics
  const reportMetrics = useMemo(() => {
    return calculateReportMetrics(currentDate, activeReport);
  }, [currentDate, activeReport]);

  // Generate chart timeline
  const chartTimeline = useMemo(() => {
    return generateChartTimeline(currentDate);
  }, [currentDate]);

  // Calculate today's position on chart
  const todayXCoordinate = useMemo(() => {
    return getTodayXCoordinate(chartTimeline);
  }, [chartTimeline]);

  // Generate engagement data points for chart
  const engagementData = useMemo(() => {
    return generateEngagementData(chartTimeline, activeReport);
  }, [chartTimeline, activeReport]);

  // Generate SVG paths for actual and predicted data
  const { actualPath, predictedPath, todayPoint } = useMemo(() => {
    if (!engagementData || engagementData.length === 0) {
      return { actualPath: '', predictedPath: '', todayPoint: null };
    }
    
    const todayIndex = engagementData.findIndex(d => d.isToday);
    
    if (todayIndex === -1) {
      return {
        actualPath: generateSVGPath(engagementData),
        predictedPath: '',
        todayPoint: null
      };
    }
    
    const actualData = engagementData.slice(0, todayIndex + 1);
    const predictedData = engagementData.slice(todayIndex);
    
    return {
      actualPath: generateSVGPath(actualData),
      predictedPath: generateSVGPath(predictedData),
      todayPoint: engagementData[todayIndex]
    };
  }, [engagementData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
        {/* Sidebar always visible */}
        <aside className="w-72">
          <Sidebar onClose={() => {}} />
        </aside>

        <main className="flex-1 overflow-y-auto w-full relative">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="font-bold text-slate-800">Amrita</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
          </header>

          {/* Loading State on Right Side */}
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
            <div className="relative flex flex-col items-center">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-slate-50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#8B0000] border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 40 40" className="text-[#FFC107]">
                    <path d="M0 20 L8 20 L12 10 L18 30 L24 15 L28 25 L32 20 L40 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">Synthesizing Reports</h2>
              <div className="bg-red-50/50 border border-red-100 px-5 py-1.5 rounded-full">
                <p className="text-[9px] font-black tracking-[0.2em] text-[#8B0000] uppercase animate-pulse">PROCESSING ACADEMIC RECORDS...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>  

      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-slate-800">Amrita</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm">
              <img 
                className="w-full h-full rounded-xl object-cover" 
                src={currentTeacher?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"} 
                alt="Faculty Avatar" 
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-[#8B0000] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                  Faculty Member
                </span>
                <span className="text-slate-300 text-xs font-mono">
                  TERM: {reportMetrics.month?.toUpperCase()} {reportMetrics.year}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {currentTeacher?.name || 'Faculty Member'}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                {currentTeacher?.designation || 'Associate Professor'} • Dept. of {currentTeacher?.department || 'CSE'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Cycle Date
              </p>
              <p className="text-sm font-black text-slate-600">
                {reportMetrics.day} {reportMetrics.month}
              </p>
              <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                {currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
              <Share2 size={18} />
            </button>
            <button className="flex items-center gap-2 bg-[#8B0000] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-red-900/20 hover:brightness-110 transition-all">
              <Download size={18} />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportKPICard 
            label="Instructional Load" 
            val={activeReport?.totalHours} 
            unit="Hrs" 
            icon={Clock}
            sub={`Target: ${activeReport?.maxWeeklyHours} Hrs`}
          />
          <ReportKPICard 
            label="Syllabus Progress" 
            val={`${Math.round(reportMetrics.syllabus)}%`} 
            unit="Avg" 
            icon={BookOpen}
            sub="Active Term Accumulation"
          />
          <ReportKPICard 
            label="Student Attendance" 
            val={`${reportMetrics.attendance}%`} 
            unit="Avg" 
            icon={Users}
            sub="Verified Check-ins"
          />
          <ReportKPICard 
            label="Feedback Score" 
            val={reportMetrics.feedback} 
            unit="/ 5.0" 
            icon={Award}
            sub="Performance Metric"
          />
        </div>

        {/* Analysis Section */}
        <div className="flex flex-col xl:flex-row gap-10 items-start">
          <EngagementCurveChart 
            chartTimeline={chartTimeline}
            todayXCoordinate={todayXCoordinate}
            reportMetrics={reportMetrics}
            engagementData={engagementData}
            actualPath={actualPath}
            predictedPath={predictedPath}
            todayPoint={todayPoint}
          />
          <EfficiencyGauge reportMetrics={reportMetrics} />
        </div>

        {/* Academic Inventory */}
        <AcademicInventoryTable subjects={activeReport?.subjects} />
        </div>
      </main>
    </div>
  );
};

export default Reports;
