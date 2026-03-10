import React, { useState } from 'react';
import {
    BarChart3, Menu, Search, AlertCircle, User, Settings2, Download, Filter,
    MoreHorizontal, Info, CheckCircle2, Activity, PieChart, Users,
    Terminal, ShieldAlert, Copy, FileText, ChevronRight, Tags, Calendar,
    UserCheck, Edit3, Zap, Printer, X
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const WorkloadReportModal = ({ faculty, onClose }) => {
    if (!faculty) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-4 md:p-6 print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:shadow-none print:h-auto print:max-h-none print:w-full">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-[#8B0000]" />
                        Workload Report: {faculty.name}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-[#8B0000] text-white text-sm font-semibold rounded-lg hover:bg-red-900 transition-colors flex items-center shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Save as PDF / Print
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-8 print:p-0 print:overflow-visible custom-scrollbar print:text-black">
                    <div className="border-b-4 border-[#8B0000] pb-6 mb-8 text-center print:pt-4">
                        <h1 className="text-3xl font-black text-[#8B0000] uppercase tracking-wide">Amrita Vishwa Vidyapeetham</h1>
                        <h2 className="text-xl font-semibold text-slate-700 mt-2">Faculty Workload Allocation Report</h2>
                        <p className="text-slate-500 mt-1">Academic Year 2025-2026</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 print:bg-white print:border-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Faculty Name</p>
                                <p className="font-bold text-slate-900 text-lg">{faculty.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Designation</p>
                                <p className="font-bold text-slate-900 text-lg">{faculty.rank}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Department</p>
                                <p className="font-bold text-slate-900 text-lg">{faculty.dept}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                <p className={`font-bold text-lg ${faculty.status === 'Overloaded' ? 'text-red-600' : faculty.status === 'Under-utilized' ? 'text-blue-600' : 'text-emerald-600'}`}>{faculty.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 print:border-2 print:break-inside-avoid">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Workload Metrics</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600">Assigned Hours</span>
                                <span className="font-bold text-lg">{faculty.currentHours}h</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-600">Maximum Capacity</span>
                                <span className="font-bold text-lg">{faculty.maxHours}h</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${faculty.currentHours > faculty.maxHours ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((faculty.currentHours / faculty.maxHours) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-6 print:border-2 print:break-inside-avoid">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Expertise & Availability</h3>
                            <div className="mb-4">
                                <span className="text-slate-600 text-sm block mb-2">Subject Areas</span>
                                <div className="flex flex-wrap gap-2">
                                    {faculty.expertise.map(exp => (
                                        <span key={exp} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold border border-slate-200">{exp}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-600 text-sm block mb-2">Contract Days</span>
                                <div className="flex flex-wrap gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                        <span key={day} className={`px-2 py-1 rounded-md text-xs font-bold border ${faculty.contractDays.includes(day) ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'}`}>{day}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500">System Generated Report • Amrita Academic Management System</p>
                        <p className="text-sm text-slate-500 mt-1">Date Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminWorkload = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnderutilized, setFilterUnderutilized] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [selectedFacultyForReport, setSelectedFacultyForReport] = useState(null);

    // US 1: Max Teaching Hours Configuration
    const [maxHoursConfig, setMaxHoursConfig] = useState({
        Professor: 8,
        'Associate Professor': 12,
        'Assistant Professor': 15,
        'Senior Lecturer': 15
    });

    // Mock Faculty Workload Data enhanced with US 4, 8, 14
    const [facultyData] = useState([
        {
            id: 1, name: 'Dr. Arvind Krishnan', dept: 'CSE', rank: 'Associate Professor',
            currentHours: 12, maxHours: 12, efficiency: 95, status: 'Balanced',
            expertise: ['Networking', 'Security'], contractDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            isNewPrep: true,
            avatar: 'https://ui-avatars.com/api/?name=Arvind+Krishnan&background=8B0000&color=fff&bold=true'
        },
        {
            id: 2, name: 'Dr. Priya Sharma', dept: 'ECE', rank: 'Assistant Professor',
            currentHours: 10, maxHours: 15, efficiency: 100, status: 'Balanced',
            expertise: ['VLSI', 'Digital Design'], contractDays: ['Tue', 'Thu'],
            avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0f172a&color=fff&bold=true'
        },
        {
            id: 3, name: 'Dr. Rajesh Kumar', dept: 'CSE', rank: 'Professor',
            currentHours: 5, maxHours: 8, efficiency: 80, status: 'Under-utilized',
            expertise: ['Thermodynamics', 'AutoCAD'], contractDays: ['Mon', 'Wed', 'Fri'],
            avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=334155&color=fff&bold=true'
        },
        {
            id: 4, name: 'Dr. Sunitha V', dept: 'CE', rank: 'Assistant Professor',
            currentHours: 14, maxHours: 15, efficiency: 90, status: 'Balanced',
            expertise: ['Structural Eng', 'Concrete'], contractDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            avatar: 'https://ui-avatars.com/api/?name=Sunitha+V&background=8B0000&color=fff&bold=true'
        },
        {
            id: 5, name: 'Dr. Vikram Seth', dept: 'CSE', rank: 'Professor',
            currentHours: 7, maxHours: 8, efficiency: 100, status: 'Balanced',
            expertise: ['AI', 'Data Ethics'], contractDays: ['Mon', 'Tue', 'Wed'],
            avatar: 'https://ui-avatars.com/api/?name=Vikram+Seth&background=0f172a&color=fff&bold=true'
        },
    ]);

    // US 7: Under-utilized Filter Logic
    const filteredFaculty = facultyData.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.dept.toLowerCase().includes(searchTerm.toLowerCase());
        const isUnder = (f.currentHours / f.maxHours) < 0.75;
        return filterUnderutilized ? (matchesSearch && isUnder) : matchesSearch;
    });

    const getStatusColor = (current, max) => {
        const load = (current / max) * 100;
        if (load > 100) return 'text-red-500 bg-red-50 border-red-100';
        if (load < 75) return 'text-blue-500 bg-blue-50 border-blue-100';
        return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    };

    const getStatusText = (current, max) => {
        const load = (current / max) * 100;
        if (load > 100) return 'Overloaded';
        if (load < 75) return 'Under-utilized';
        return 'Balanced';
    };

    const handleExportPDF = () => alert("Exporting Workload Matrix to PDF...");
    const handleCopyProfile = (rank) => alert(`Initializing new ${rank} profile. Copying base workload: ${maxHoursConfig[rank]} hours/week.`);

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <main className="flex-1 overflow-y-auto w-full relative">
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-slate-800">Amrita</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                                <BarChart3 size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Workload Optimization</h1>
                                <p className="text-left text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest leading-none">HR Compliance & Resource Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleExportPDF} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-bold shadow-sm">
                                <FileText size={18} /> PDF Export
                            </button>
                        </div>
                    </div>

                    {/* US 1: Configuration Panel */}
                    {showConfig && (
                        <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-2xl p-8 mb-12 animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                    <ShieldAlert size={20} />
                                </div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Max Teaching Hour Caps (HR Policies)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(maxHoursConfig).map(([rank, hours]) => (
                                    <div key={rank} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rank}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={hours}
                                                onChange={(e) => setMaxHoursConfig({ ...maxHoursConfig, [rank]: parseInt(e.target.value) })}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-sm font-black text-slate-900 outline-none focus:border-[#8B0000]"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400">HRS</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* US 3: Visual Workload Chart (Aggregate) - FIXED VISIBILITY */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                        {/* Interactive Bar Chart for US 5 */}
                        <div className="xl:col-span-2 bg-gradient-to-br from-white to-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group/card hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/50 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover/card:scale-110" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100/80 pb-6">
                                <div>
                                    <h3 className="font-black text-2xl text-slate-800 tracking-tight flex items-center gap-3 text-left">
                                        <Activity size={24} className="text-[#8B0000]" /> Load Distribution Matrix
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 text-left">Assigned vs Max Capacity (%)</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Over</span>
                                    </div>
                                    <div className="w-px h-4 bg-slate-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Optimal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end gap-4 h-72">
                                {/* Y-Axis Labels */}
                                <div className="flex flex-col justify-between h-64 pb-10 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-right w-6 shrink-0">
                                    <span>20H</span>
                                    <span>15H</span>
                                    <span>10H</span>
                                    <span>5H</span>
                                    <span>0H</span>
                                </div>

                                {/* Bar Graph Container */}
                                <div className="flex-1 h-64 flex items-end justify-around gap-2 px-2 border-b-2 border-slate-100 pb-2 bg-slate-50/30 rounded-t-3xl border-t border-x border-slate-50 relative group/chart">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-2 opacity-50">
                                        <div className="border-t border-slate-100 w-full" />
                                        <div className="border-t border-slate-100 w-full" />
                                        <div className="border-t border-slate-100 w-full" />
                                        <div className="border-t border-slate-100 w-full" />
                                    </div>

                                    {facultyData.map((f, i) => {
                                        // Calculate percentage relative to 20H max for consistent Y-axis alignment
                                        const heightPercentage = Math.min((f.currentHours / 20) * 100, 100);
                                        const loadPercentage = Math.min((f.currentHours / f.maxHours) * 100, 100);

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[30px] h-full justify-end z-10 text-left">
                                                {/* The Bar */}
                                                <div
                                                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 relative overflow-hidden shadow-lg ${loadPercentage >= 100 ? 'bg-red-500 shadow-red-200' : 'bg-emerald-500 shadow-emerald-100'}`}
                                                    style={{ height: `${heightPercentage}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-30" />
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                {/* Label */}
                                                <div className="mt-4 overflow-visible whitespace-nowrap">
                                                    <span className="text-[9px] font-black text-slate-400 block uppercase tracking-tighter">
                                                        {f.name.split(' ').slice(-1)}
                                                    </span>
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl px-3 py-2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-30 shadow-2xl">
                                                    <div className="text-[#8B0000] mb-0.5">CURRENT: {f.currentHours}H</div>
                                                    <div className="opacity-70 text-[9px]">LIMIT: {f.maxHours}H</div>
                                                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Preferences (US 2) */}
                        <div className="bg-gradient-to-b from-white to-purple-50/30 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group/card hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/40 rounded-full blur-[60px] -mr-20 -mt-20 transition-transform duration-700 group-hover/card:scale-110" />
                            <h3 className="font-black text-xl text-slate-800 tracking-tight mb-8 text-left flex items-center gap-3 relative z-10">
                                <Users size={20} className="text-purple-600" /> Pending Picks
                            </h3>
                            <div className="space-y-4 flex-1 relative z-10">
                                <div className="p-5 rounded-[1.5rem] bg-white border border-purple-100/60 shadow-sm relative group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-purple-100/50 flex items-center justify-center text-purple-600 font-bold text-xs ring-1 ring-inset ring-purple-200/50">DR</div>
                                            <h4 className="font-black text-sm text-slate-800 tracking-tight">Dr. Rajesh</h4>
                                        </div>
                                        <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/50 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" /> Pending
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                                        {['Cloud', 'AI Ethics', 'Networking'].map(p => (
                                            <span key={p} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100/80 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-default">{p}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-200 border-dashed flex flex-col items-center justify-center h-28 gap-2 group hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 group-hover:text-amber-500 transition-colors">
                                        <Filter size={14} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Awaiting submissions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Faculty Workload Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[500px]">
                        <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-50/50 to-white">
                            <div className="text-left">
                                <h3 className="font-black text-2xl text-slate-800 tracking-tight">Faculty Load Tracking</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Subject Expertise & Contract Mapping</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => setFilterUnderutilized(!filterUnderutilized)}
                                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all shadow-sm ${filterUnderutilized ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                                >
                                    US 7: Under-utilized
                                </button>
                                <div className="relative group/search">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-amber-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search expertise..."
                                        className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all w-72 shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto text-left">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Faculty & Rank</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Load Gauge</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredFaculty.map((faculty) => (
                                        <tr key={faculty.id} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-[#8B0000] overflow-hidden shadow-inner bg-slate-50">
                                                        <img src={faculty.avatar} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-black text-slate-800 tracking-tight leading-none mb-1.5">{faculty.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black text-[#8B0000] uppercase tracking-widest">{faculty.dept}</span>
                                                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{faculty.rank}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(faculty.currentHours, faculty.maxHours)}`}>
                                                            {getStatusText(faculty.currentHours, faculty.maxHours)}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black text-slate-900 leading-none">{faculty.currentHours}h</span>
                                                            <span className="text-[10px] font-black text-slate-300 leading-none">/</span>
                                                            <span className="text-[10px] font-black text-slate-400 leading-none">{faculty.maxHours}h</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${faculty.currentHours > faculty.maxHours ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-emerald-500 shadow-lg shadow-emerald-100'}`}
                                                            style={{ width: `${Math.min((faculty.currentHours / faculty.maxHours) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => alert(`Opening edit form for ${faculty.name}...`)} className="p-3 text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-2xl transition-all shadow-md flex items-center gap-2" title="Edit Faculty Workload">
                                                        <Edit3 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Edit</span>
                                                    </button>
                                                    <button onClick={() => setSelectedFacultyForReport(faculty)} className="p-3 text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 rounded-2xl transition-all shadow-md flex items-center gap-2" title="Generate Report">
                                                        <Printer size={16} /> <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Generate Report</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* US 14: Automated Insights */}
                    <div className="mt-12 p-10 bg-[#8B0000] rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl shadow-red-900/40">
                        <div className="absolute right-[-5%] top-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                        <div className="w-16 h-16 bg-white text-[#8B0000] rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl relative z-10">
                            <Zap size={32} />
                        </div>
                        <div className="relative z-10 text-left">
                            <h4 className="font-black text-2xl tracking-tight mb-2 uppercase tracking-widest">US 14: New Prep Policy Active</h4>
                            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-2xl">
                                First-time assignments for courses trigger a <span className="text-white font-black underline decoration-white/30 decoration-2">1.5x load factor</span>. This ensures labor policies account for curriculum development time.
                            </p>
                        </div>
                    </div>

                </div>

                <footer className="px-12 py-12 text-center border-t border-slate-100 bg-white mt-12">
                    <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.8em]">
                        Amrita Vishwa Vidyapeetham • Academic Governance
                    </p>
                </footer>
            </main>
            {selectedFacultyForReport && <WorkloadReportModal faculty={selectedFacultyForReport} onClose={() => setSelectedFacultyForReport(null)} />}
        </div>
    );
};

export default AdminWorkload;
