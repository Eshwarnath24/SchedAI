
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Zap,
    CheckCircle2,
    Loader2,
    AlertTriangle,
    Users,
    UserCheck,
    Clock,
    Lock,
    X,
    Edit2
} from 'lucide-react';
import { fetchPreferenceCourses, fetchPreferenceStatus, triggerScheduleGeneration } from '../../utils/api';

const getTypeStyles = (type) => {
    switch (type) {
        case 'PROFESSIONAL ELECTIVE': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
        case 'FREE ELECTIVE': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        case 'Lab': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'CIR': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'CORE COURSE':
        case 'Theory':
        default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
};

const Allocation = () => {
    // --- State ---
    const [courseData, setCourseData] = useState({});
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [formReleased, setFormReleased] = useState(false);
    const [recallModalOpen, setRecallModalOpen] = useState(false);
    const [courseModal, setCourseModal] = useState({ isOpen: false, data: null, sem: null });

    // Faculty preference status
    const [prefStatus, setPrefStatus] = useState(null);
    // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const confirmRecall = () => {
        setFormReleased(false);
        setRecallModalOpen(false);
    };

    const handleSaveCourse = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const ltp = fd.get('l_val') + '-' + fd.get('t_val') + '-' + fd.get('p_val');
        const sem = courseModal.data ? courseModal.data._sem : courseModal.sem;
        const updated = {
            ...(courseModal.data || {}),
            code: fd.get('code'),
            title: fd.get('title'),
            ltp,
            credits: fd.get('credits'),
            type: fd.get('type') || 'CORE COURSE',
        };
        if (courseModal.data) {
            setCourseData(prev => {
                const next = { ...prev };
                next[sem] = (next[sem] || []).map(c =>
                    (c._id && c._id === updated._id) || c.code === updated.code ? updated : c
                );
                return next;
            });
        } else {
            setCourseData(prev => {
                const next = { ...prev };
                next[sem] = [...(next[sem] || []), updated];
                return next;
            });
        }
        setCourseModal({ isOpen: false, data: null, sem: null });
    };

    const deleteCourse = (semNum, courseCode) => {
        if (window.confirm('Are you sure you want to remove this course?')) {
            setCourseData(prev => {
                const next = { ...prev };
                next[semNum] = (next[semNum] || []).filter(c => c.code !== courseCode);
                return next;
            });
        }
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Course Management</h1>
                    <p className="text-slate-500 font-medium">B.Tech Program - Session 2025-26</p>
                </div>
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

            {/* â”€â”€ Faculty Preference Status + Generate Timetable â”€â”€ */}
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
                                <span className="block mt-1 text-emerald-300 font-bold">âœ“ All faculty have submitted their preferences!</span>
                            )}
                        </p>
                        <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${allSubmitted ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-yellow-400 to-yellow-300'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
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

            {/* â”€â”€ Course Matrix â”€â”€ */}
            <div className="space-y-4">
                {/* Section header with Release/Recall control */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Course Matrix</h3>
                            {formReleased && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                                    <Lock size={12} /> Locked
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Configure courses for the active cycle. Lock when ready to release to faculty.</p>
                    </div>
                    <button
                        onClick={() => formReleased ? setRecallModalOpen(true) : setFormReleased(true)}
                        className={"px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all " + (formReleased ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : "bg-[#9b1c31] text-white hover:bg-[#801629] hover:shadow-lg")}
                    >
                        {formReleased ? 'Recall Form' : 'Release Form'}
                    </button>
                </div>

                {/* Semester course table */}
                {selectedSemester && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9b1c31] flex items-center justify-center font-black">
                                    S{selectedSemester}
                                </div>
                                <h4 className="font-bold text-gray-900">
                                    Semester {selectedSemester}
                                    <span className="text-gray-400 font-medium text-sm ml-2">({currentCourses.length} courses)</span>
                                </h4>
                            </div>
                            <button
                                disabled={formReleased}
                                onClick={() => setCourseModal({ isOpen: true, data: null, sem: selectedSemester })}
                                className={"flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm " + (formReleased ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-[#9b1c31] bg-white border border-red-100 hover:bg-red-50 hover:border-red-200")}
                            >
                                <Plus size={14} strokeWidth={3} /> Add Course
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 pl-6 font-bold w-1/4">Course Code</th>
                                        <th className="p-4 font-bold">Title</th>
                                        <th className="p-4 font-bold">L-T-P</th>
                                        <th className="p-4 font-bold">Credits</th>
                                        <th className="p-4 pr-6 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentCourses.length > 0 ? currentCourses.map((course, idx) => {
                                        const courseType = course.type || course.category || 'Theory';
                                        const isPF = course.credits === 'P/F';
                                        return (
                                            <tr key={course._id || course.code || idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-[#9b1c31] mb-1 font-mono text-sm">{course.code}</div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${getTypeStyles(courseType)}`}>
                                                        {courseType}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900">{course.title || course.name}</td>
                                                <td className="p-4 text-xs text-gray-500 font-medium">{course.ltp || '-'}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-black">
                                                        {isPF ? 'P/F' : `${course.credits} Cr`}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button
                                                        disabled={formReleased}
                                                        onClick={() => setCourseModal({ isOpen: true, data: { ...course, _sem: selectedSemester }, sem: null })}
                                                        className={"p-1.5 transition-colors mr-1 " + (formReleased ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-blue-600")}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        disabled={formReleased}
                                                        onClick={() => deleteCourse(selectedSemester, course.code)}
                                                        className={"p-1.5 transition-colors " + (formReleased ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-600")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-gray-400 text-sm">No courses configured for this semester.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* â”€â”€ Recall Confirmation Modal â”€â”€ */}
            {recallModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Recall Form?</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Recalling the form will <strong className="text-red-600">unlock course editing</strong> and prevent faculty from submitting new preferences until the form is re-released.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setRecallModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={confirmRecall} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Yes, Recall</button>
                        </div>
                    </div>
                </div>
            )}

            {/* â”€â”€ Add / Edit Course Modal â”€â”€ */}
            {courseModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900">{courseModal.data ? 'Edit Course' : 'Add New Course'}</h3>
                            <button onClick={() => setCourseModal({ isOpen: false, data: null, sem: null })} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCourse} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Course Code</label>
                                <input required name="code" defaultValue={courseModal.data?.code} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none transition-all" placeholder="e.g. 23CSE301" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Course Title</label>
                                <input required name="title" defaultValue={courseModal.data?.title || courseModal.data?.name} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none transition-all" placeholder="e.g. Operating Systems" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Course Type</label>
                                <select name="type" defaultValue={courseModal.data?.type || courseModal.data?.category || 'CORE COURSE'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-[#9b1c31] outline-none">
                                    <option value="CORE COURSE">Core Course</option>
                                    <option value="PROFESSIONAL ELECTIVE">Professional Elective</option>
                                    <option value="FREE ELECTIVE">Free Elective</option>
                                    <option value="Lab">Lab</option>
                                    <option value="CIR">CIR</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        L-T-P <span className="lowercase font-normal text-gray-400 tracking-normal">(Lec-Tut-Prac)</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input required name="l_val" type="number" min="0" max="9" defaultValue={courseModal.data?.ltp?.split('-')[0] || ''} className="flex-1 px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none" placeholder="L" />
                                        <span className="text-gray-400 font-bold">-</span>
                                        <input required name="t_val" type="number" min="0" max="9" defaultValue={courseModal.data?.ltp?.split('-')[1] || ''} className="flex-1 px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none" placeholder="T" />
                                        <span className="text-gray-400 font-bold">-</span>
                                        <input required name="p_val" type="number" min="0" max="9" defaultValue={courseModal.data?.ltp?.split('-')[2] || ''} className="flex-1 px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none" placeholder="P" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Credits</label>
                                    <input required name="credits" defaultValue={courseModal.data?.credits} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9b1c31] focus:border-transparent outline-none" placeholder="e.g. 4" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-4 bg-[#9b1c31] text-white rounded-xl font-bold shadow-lg shadow-red-900/20 hover:bg-[#801629] hover:-translate-y-0.5 transition-all">
                                    {courseModal.data ? 'Save Changes' : 'Add Course'}
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
                .animate-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default Allocation;
