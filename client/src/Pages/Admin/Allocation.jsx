
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Zap,
    Send,
    CheckCircle2,
    ChevronRight,
    Search,
    BookOpen
} from 'lucide-react';

const CATEGORIES_ORDER = {
    'Core': 1,
    'PE': 2,
    'FE': 3,
    'Audit': 4
};

const CATEGORY_NAMES = {
    'Core': 'Core Course',
    'PE': 'Professional Elective',
    'FE': 'Free Elective',
    'Audit': 'Audit Course'
};

const Allocation = () => {
    // --- Mock Data ---
    const initialData = {
        year1: {
            1: [
                { code: '24MAT101', title: 'Calculus', ltp: '3-1-0', credits: '4', category: 'Core' },
                { code: '24PHY101', title: 'Engineering Physics', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '24CSE101', title: 'Problem Solving & C Programming', ltp: '3-0-2', credits: '4', category: 'Core' }
            ], 2: [
                { code: '24MAT102', title: 'Linear Algebra', ltp: '3-1-0', credits: '4', category: 'Core' },
                { code: '24CSE102', title: 'Data Structures', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '24ENG101', title: 'Professional Communication', ltp: '2-0-2', credits: '3', category: 'Core' }
            ]
        },
        year2: {
            3: [
                { code: '19CSE201', title: 'Computer Organization & Architecture', ltp: '3-1-0', credits: '4', category: 'Core' },
                { code: '19CSE202', title: 'Object Oriented Programming', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19MAT201', title: 'Discrete Mathematics', ltp: '3-1-0', credits: '4', category: 'Core' },
                { code: '19HUM201', title: 'Environmental Sciences', ltp: '2-0-0', credits: 'P/F', category: 'Audit' }
            ], 4: [
                { code: '19CSE211', title: 'Design & Analysis of Algorithms', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19CSE212', title: 'Software Engineering', ltp: '3-0-0', credits: '3', category: 'Core' },
                { code: '19CSE213', title: 'Java Programming', ltp: '2-0-2', credits: '3', category: 'Core' },
                { code: '19AVP201', title: 'Amrita Values Program', ltp: '1-0-0', credits: 'P/F', category: 'Audit' }
            ]
        },
        year3: {
            5: [
                { code: '19CSE301', title: 'Operating Systems', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19CSE302', title: 'Database Management', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19CSE303', title: 'Theory of Computation', ltp: '3-1-0', credits: '4', category: 'Core' },
                { code: '19CSE331', title: 'Data Mining', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19SSK301', title: 'Soft Skills I', ltp: '1-0-2', credits: 'P/F', category: 'Audit' }
            ], 6: [
                { code: '19CSE311', title: 'Computer Networks', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19CSE312', title: 'Compiler Design', ltp: '3-0-2', credits: '4', category: 'Core' },
                { code: '19CSE332', title: 'Cloud Computing', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19OEL301', title: 'Photography', ltp: '2-0-0', credits: '2', category: 'FE' },
                { code: '19SSK302', title: 'Soft Skills II', ltp: '1-0-2', credits: 'P/F', category: 'Audit' }
            ]
        },
        year4: {
            7: [
                { code: '19CSE401', title: 'Artificial Intelligence', ltp: '3-0-0', credits: '3', category: 'Core' },
                { code: '19CSE431', title: 'Blockchain Technologies', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19CSE432', title: 'Natural Language Processing', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19OEL401', title: 'Financial Management', ltp: '3-0-0', credits: '3', category: 'FE' },
                { code: '19CSE491', title: 'Project Phase I', ltp: '0-0-12', credits: '4', category: 'Core' }
            ], 8: [
                { code: '19CSE433', title: 'Cyber Security', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19CSE434', title: 'Internet of Things', ltp: '3-0-0', credits: '3', category: 'PE' },
                { code: '19CSE492', title: 'Project Phase II', ltp: '0-0-24', credits: '8', category: 'Core' }
            ]
        }
    };

    const initialFaculties = [
        { name: 'Dr. Amitabh Mukherjee', status: 'Not Sent' },
        { name: 'Prof. Lakshmi Narayan', status: 'Not Sent' },
        { name: 'Dr. Sunita Deshmukh', status: 'Not Sent' },
        { name: 'Dr. Ramesh Chandra', status: 'Not Sent' },
        { name: 'Dr. Gitanjali Rao', status: 'Not Sent' },
        { name: 'Prof. Venkat Subramanian', status: 'Not Sent' }
    ];

    // --- State ---
    const [courseData, setCourseData] = useState(initialData);
    const [faculties, setFaculties] = useState(initialFaculties);
    const [currentYear, setCurrentYear] = useState(1);
    const [currentSemType, setCurrentSemType] = useState('odd');
    const [isSending, setIsSending] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState({ semNum: null, index: null });
    const [formData, setFormData] = useState({ code: '', title: '', ltp: '', credits: '4', category: 'Core' });

    // --- Computed ---
    const completedCount = faculties.filter(f => f.status === 'Completed').length;
    const totalFaculties = faculties.length;
    const progress = (completedCount / totalFaculties) * 100;
    const allReceived = completedCount === totalFaculties;

    const activeSemesters = currentSemType === 'odd' ?
        [currentYear * 2 - 1] :
        [currentYear * 2];

    // --- UI Logic ---
    const sendForms = () => {
        setIsSending(true);
        setTimeout(() => {
            setFaculties(prev => prev.map(f => ({ ...f, status: 'Pending' })));
            simulateResponses();
        }, 1500);
    };

    const simulateResponses = () => {
        initialFaculties.forEach((f, index) => {
            const delay = 2000 + Math.random() * 8000;
            setTimeout(() => {
                setFaculties(prev => {
                    const next = [...prev];
                    next[index].status = 'Completed';
                    return next;
                });
            }, delay * (index + 1) / 2);
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const { semNum, index } = editingConfig;

        setCourseData(prev => {
            const next = { ...prev };
            const yearKey = `year${currentYear}`;
            const courses = [...next[yearKey][semNum]];

            if (index !== null) {
                courses[index] = formData;
            } else {
                courses.push(formData);
            }

            next[yearKey][semNum] = courses;
            return next;
        });

        setShowModal(false);
        setEditingConfig({ semNum: null, index: null });
    };

    const deleteCourse = (semNum, index) => {
        if (window.confirm('Are you sure you want to remove this course?')) {
            setCourseData(prev => {
                const next = { ...prev };
                const yearKey = `year${currentYear}`;
                const courses = [...next[yearKey][semNum]];
                courses.splice(index, 1);
                next[yearKey][semNum] = courses;
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
        const yearKey = `year${currentYear}`;
        const course = courseData[yearKey][semNum][index];
        setFormData(course);
        setEditingConfig({ semNum, index });
        setShowModal(true);
    };

    // --- SORTING LOGIC ---
    const getSortedCourses = (courses) => {
        return [...courses].sort((a, b) => {
            // First by categories order (Core > PE > FE > Audit)
            const orderA = CATEGORIES_ORDER[a.category] || 99;
            const orderB = CATEGORIES_ORDER[b.category] || 99;

            if (orderA !== orderB) return orderA - orderB;

            // Then by pass/fail status (if credits is P/F, it should be last within its category or just generally?)
            // The user said: "next will be professional electives and free electives and then pass / fail subjects"
            // So P/F generally at the end.
            const isPFA = a.credits === 'P/F';
            const isPFB = b.credits === 'P/F';

            if (isPFA && !isPFB) return 1;
            if (!isPFA && isPFB) return -1;

            // Finally alphabetic by code
            return a.code.localeCompare(b.code);
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Course Management</h1>
                    <p className="text-slate-500 font-medium">B.Tech Program - Session 2024-25</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <span className="pl-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Cycle:</span>
                        <div className="flex bg-white rounded-xl shadow-sm p-1">
                            <button
                                onClick={() => setCurrentSemType('odd')}
                                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${currentSemType === 'odd' ? 'bg-[#9b1c31] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                ODD
                            </button>
                            <button
                                onClick={() => setCurrentSemType('even')}
                                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${currentSemType === 'even' ? 'bg-[#9b1c31] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                EVEN
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Readiness Dashboard */}
            <div className="bg-[#9b1c31] rounded-[32px] p-8 text-white shadow-2xl shadow-[#9b1c31]/20 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Send size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Faculty Readiness Status</h3>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Before generating the final timetable, all faculty members must submit their course preferences.
                            Current completion: <span className="font-bold text-white underline decoration-yellow-400 decoration-2 underline-offset-4">{completedCount} of {totalFaculties}</span>
                        </p>

                        <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-right from-yellow-400 to-yellow-300 transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {!allReceived ? (
                            <button
                                onClick={sendForms}
                                disabled={isSending || faculties[0].status === 'Pending'}
                                className="px-8 py-4 bg-white text-[#9b1c31] rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSending ? 'SENDING...' : (faculties[0].status === 'Pending' ? 'WAITING FOR RESPONSES...' : 'SEND FORMS TO ALL FACULTY')}
                            </button>
                        ) : (
                            <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <Zap size={18} fill="currentColor" /> GENERATE TIMETABLE
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Year Selector */}
            <div className="flex justify-center">
                <div className="inline-flex bg-white p-2 rounded-[24px] shadow-sm border border-slate-100 mb-2">
                    {[1, 2, 3, 4].map(year => (
                        <button
                            key={year}
                            onClick={() => setCurrentYear(year)}
                            className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${currentYear === year ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            YEAR {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Semesters Container */}
            <div className="space-y-12">
                {activeSemesters.map(semNum => {
                    const yearKey = `year${currentYear}`;
                    const courses = courseData[yearKey][semNum] || [];
                    const sortedCourses = getSortedCourses(courses);

                    return (
                        <div key={semNum} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-[#F8FAFC]/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#9b1c31] font-black text-xl shadow-sm border border-slate-100">
                                        S{semNum}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Semester {semNum}</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{courses.length} Courses Allocated</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openAddModal(semNum)}
                                    className="px-6 py-3 bg-[#9b1c31] text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-[#801629] transition-colors shadow-lg shadow-[#9b1c31]/20"
                                >
                                    <Plus size={16} strokeWidth={3} /> ADD NEW COURSE
                                </button>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Code & Category</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">L-T-P</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Credits</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sortedCourses.length > 0 ? sortedCourses.map((course, idx) => {
                                            const isPF = course.credits === 'P/F';
                                            return (
                                                <tr key={`${course.code}-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1.5 whitespace-nowrap">
                                                            <span className="text-sm font-black text-[#9b1c31] tracking-tight">{course.code}</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md w-fit uppercase tracking-wider border ${course.category === 'Core' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                                course.category === 'PE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    course.category === 'FE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                                }`}>
                                                                {CATEGORY_NAMES[course.category] || course.category}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-bold text-slate-700 block min-w-[200px]">{course.title}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 whitespace-nowrap inline-block">{course.ltp}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center whitespace-nowrap">
                                                        <span className={`text-xs font-black px-4 py-1.5 rounded-xl border ${isPF ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 shadow-sm'
                                                            }`}>
                                                            {isPF ? 'PASS / FAIL' : `${course.credits} CREDITS`}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            <button
                                                                onClick={() => openEditModal(semNum, idx)}
                                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteCourse(semNum, idx)}
                                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                                                            <BookOpen size={30} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-slate-500 font-bold">No courses allocated yet.</p>
                                                            <p className="text-xs text-slate-400 font-medium">Click the button above to start building the curriculum.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

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
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 19CSE301"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">L-T-P</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="3-0-2"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                        value={formData.ltp}
                                        onChange={e => setFormData({ ...formData, ltp: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full course name"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credits</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold appearance-none"
                                        value={formData.credits}
                                        onChange={e => setFormData({ ...formData, credits: e.target.value })}
                                    >
                                        <option value="1">1 Credit</option>
                                        <option value="2">2 Credits</option>
                                        <option value="3">3 Credits</option>
                                        <option value="4">4 Credits</option>
                                        <option value="P/F">Pass / Fail</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9b1c31]/20 focus:bg-white transition-all text-sm font-bold appearance-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Core">Core Subject</option>
                                        <option value="PE">Professional Elective</option>
                                        <option value="FE">Free Elective</option>
                                        <option value="Audit">Audit / Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 px-12 py-4 bg-[#9b1c31] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#9b1c31]/20 hover:bg-[#801629] transition-colors"
                                >
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
                .animate-in {
                    animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .custom-scrollbar.hide-bar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .custom-scrollbar.hide-bar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default Allocation;
