
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Zap,
    CheckCircle2,
    BookOpen,
    Loader2,
    AlertTriangle,
    Users,
    UserCheck,
    Clock
} from 'lucide-react';
import { fetchPreferenceCourses, fetchPreferenceStatus, triggerScheduleGeneration } from '../../utils/api';

const TYPE_BADGES = {
    'Theory': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    'Lab': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    'CIR': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
};

const Allocation = () => {
    // --- State ---
    const [courseData, setCourseData] = useState({}); // { semNum: [course, ...] }
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState({ semNum: null, index: null });
    const [formData, setFormData] = useState({ code: '', title: '', ltp: '', credits: '4', category: 'Core' });

    // Faculty preference status
    const [prefStatus, setPrefStatus] = useState(null);
    const [prefStatusLoading, setPrefStatusLoading] = useState(true);

    const semesterCycle = 'odd'; // Current cycle

    // --- Load courses from DB (single cycle) ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchPreferenceCourses(semesterCycle);
                const courses = res.courses || {};
                // Filter out empty semesters
                const nonEmpty = {};
                Object.entries(courses).forEach(([sem, list]) => {
                    if (list && list.length > 0) {
                        nonEmpty[sem] = list;
                    }
                });
                setCourseData(nonEmpty);
                // Auto-select first non-empty semester
                const sems = Object.keys(nonEmpty).map(Number).sort((a, b) => a - b);
                if (sems.length > 0 && !selectedSemester) {
                    setSelectedSemester(sems[0]);
                }
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [semesterCycle]);

    // --- Load faculty preference status ---
    useEffect(() => {
        const loadStatus = async () => {
            setPrefStatusLoading(true);
            try {
                const status = await fetchPreferenceStatus(semesterCycle);
                setPrefStatus(status);
            } catch (err) {
                console.error('Failed to fetch preference status:', err);
            } finally {
                setPrefStatusLoading(false);
            }
        };
        loadStatus();
        // Poll every 30 seconds
        const interval = setInterval(loadStatus, 30000);
        return () => clearInterval(interval);
    }, [semesterCycle]);

    // --- Computed ---
    const availableSemesters = Object.keys(courseData).map(Number).sort((a, b) => a - b);
    const currentCourses = selectedSemester ? (courseData[selectedSemester] || []) : [];

    const submittedCount = prefStatus?.submittedCount || 0;
    const totalFaculty = prefStatus?.totalFaculty || 0;
    const allSubmitted = prefStatus?.allSubmitted || false;
    const progress = totalFaculty > 0 ? (submittedCount / totalFaculty) * 100 : 0;

    // --- Generate Timetable ---
    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerateResult(null);
        setError(null);
        try {
            const result = await triggerScheduleGeneration();
            setGenerateResult(result);
        } catch (err) {
            console.error('Failed to generate timetable:', err);
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- UI Logic ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const { semNum, index } = editingConfig;
        setCourseData(prev => {
            const next = { ...prev };
            const courses = [...(next[semNum] || [])];
            if (index !== null) {
                courses[index] = formData;
            } else {
                courses.push(formData);
            }
            next[semNum] = courses;
            return next;
        });
        setShowModal(false);
        setEditingConfig({ semNum: null, index: null });
    };

    const deleteCourse = (semNum, index) => {
        if (window.confirm('Are you sure you want to remove this course?')) {
            setCourseData(prev => {
                const next = { ...prev };
                const courses = [...(next[semNum] || [])];
                courses.splice(index, 1);
                next[semNum] = courses;
                return next;
            });
        }
    };

    const openAddModal = (semNum) => {
        setFormData({ code: '', title: '', ltp: '', credits: '4', category: 'Core' });
        setEditingConfig({ semNum, index: null });
        setShowModal(true);
    };

    const openEditModal = (semNum, index) => {
        const course = courseData[semNum][index];
        setFormData({
            code: course.code || '',
            title: course.title || course.name || '',
            ltp: course.ltp || '',
            credits: String(course.credits || '4'),
            category: course.category || 'Core'
        });
        setEditingConfig({ semNum, index });
        setShowModal(true);
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-[#9b1c31] animate-spin" />
                    <p className="text-slate-500 font-medium">Loading courses from database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Course Management</h1>
                    <p className="text-slate-500 font-medium">B.Tech Program - Session 2025-26</p>
                </div>

                {/* Semester Selector */}
                {availableSemesters.length > 1 && (
                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <span className="pl-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Semester:</span>
                        <div className="flex bg-white rounded-xl shadow-sm p-1">
                            {availableSemesters.map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setSelectedSemester(sem)}
                                    className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${selectedSemester === sem ? 'bg-[#9b1c31] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    S{sem}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm font-medium">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Faculty Readiness + Generate Timetable Dashboard */}
            <div className="bg-[#9b1c31] rounded-[32px] p-8 text-white shadow-2xl shadow-[#9b1c31]/20 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Users size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Faculty Preference Status</h3>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                            All faculty members must submit their course preferences before the timetable can be generated.
                            {!allSubmitted && (
                                <span className="block mt-1"> Current completion: <span className="font-bold text-white underline decoration-yellow-400 decoration-2 underline-offset-4">{submittedCount} of {totalFaculty}</span> faculty submitted.</span>
                            )}
                            {allSubmitted && (
                                <span className="block mt-1 text-emerald-300 font-bold">✓ All faculty have submitted their preferences!</span>
                            )}
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${allSubmitted ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-yellow-400 to-yellow-300'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Faculty list quick view */}
                        {prefStatus?.faculty && !allSubmitted && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {prefStatus.faculty.map(f => (
                                    <div key={f._id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${f.submitted ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'}`}>
                                        {f.submitted ? <UserCheck size={12} /> : <Clock size={12} />}
                                        {f.name.split(' ').slice(0, 2).join(' ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {generateResult ? (
                            <div className="flex flex-col items-end gap-3">
                                <div className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-3">
                                    <CheckCircle2 size={18} /> TIMETABLE GENERATED
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!allSubmitted}
                                    className="px-6 py-3 bg-white/20 text-white rounded-2xl font-black text-xs hover:bg-white/30 transition-all backdrop-blur-md disabled:opacity-40"
                                >
                                    REGENERATE
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !allSubmitted}
                                className="px-8 py-4 bg-white text-[#9b1c31] rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                title={!allSubmitted ? `Waiting for ${totalFaculty - submittedCount} more faculty to submit` : ''}
                            >
                                {isGenerating ? (
                                    <><Loader2 size={18} className="animate-spin" /> GENERATING TIMETABLE...</>
                                ) : !allSubmitted ? (
                                    <><Clock size={18} /> WAITING FOR ALL FACULTY ({submittedCount}/{totalFaculty})</>
                                ) : (
                                    <><Zap size={18} fill="currentColor" /> GENERATE TIMETABLE</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Generation Result Info */}
                {generateResult && (
                    <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
                        <div className="flex gap-8 text-sm">
                            <div>
                                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Fitness Score</span>
                                <p className="text-white font-black text-lg">{generateResult.fitness?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Classes Scheduled</span>
                                <p className="text-white font-black text-lg">{generateResult.classCount || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Single Semester Course List */}
            {selectedSemester && currentCourses.length > 0 && (
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-[#F8FAFC]/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#9b1c31] font-black text-xl shadow-sm border border-slate-100">
                                S{selectedSemester}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Semester {selectedSemester}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentCourses.length} Courses</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openAddModal(selectedSemester)}
                            className="px-6 py-3 bg-[#9b1c31] text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-[#801629] transition-colors shadow-lg shadow-[#9b1c31]/20"
                        >
                            <Plus size={16} strokeWidth={3} /> ADD NEW COURSE
                        </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Code & Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">L-T-P</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Credits</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentCourses.map((course, idx) => {
                                    const isPF = course.credits === 'P/F';
                                    const courseType = course.type || 'Theory';
                                    const typeBadge = TYPE_BADGES[courseType] || TYPE_BADGES['Theory'];
                                    return (
                                        <tr key={`${course.code || course._id}-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5 whitespace-nowrap">
                                                    <span className="text-sm font-black text-[#9b1c31] tracking-tight">{course.code}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md w-fit uppercase tracking-wider border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}>
                                                        {courseType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-slate-700 block min-w-[200px]">{course.title || course.name}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 whitespace-nowrap inline-block">{course.ltp || '-'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center whitespace-nowrap">
                                                <span className={`text-xs font-black px-4 py-1.5 rounded-xl border ${isPF ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}>
                                                    {isPF ? 'PASS / FAIL' : `${course.credits} CREDITS`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    <button onClick={() => openEditModal(selectedSemester, idx)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => deleteCourse(selectedSemester, idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty state when no courses for selected semester */}
            {selectedSemester && currentCourses.length === 0 && (
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                            <BookOpen size={30} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 font-bold">No courses for Semester {selectedSemester}.</p>
                            <p className="text-xs text-slate-400 font-medium">This semester has no courses in the database.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingConfig.index !== null ? 'Edit Course' : 'Add New Course'}
                            </h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Semester {editingConfig.semNum}</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                                    <input type="text" required placeholder="e.g. 19CSE301"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                        value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">L-T-P</label>
                                    <input type="text" required placeholder="3-0-2"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                        value={formData.ltp} onChange={e => setFormData({ ...formData, ltp: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title</label>
                                <input type="text" required placeholder="Enter full course name"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credits</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold appearance-none"
                                        value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })}>
                                        <option value="1">1 Credit</option>
                                        <option value="2">2 Credits</option>
                                        <option value="3">3 Credits</option>
                                        <option value="4">4 Credits</option>
                                        <option value="P/F">Pass / Fail</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold appearance-none"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="Core">Core Subject</option>
                                        <option value="PE">Professional Elective</option>
                                        <option value="FE">Free Elective</option>
                                        <option value="Audit">Audit / Others</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors">
                                    CANCEL
                                </button>
                                <button type="submit"
                                    className="flex-2 px-12 py-4 bg-[#9b1c31] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#9b1c31]/20 hover:bg-[#801629] transition-colors">
                                    SAVE COURSE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default Allocation;
