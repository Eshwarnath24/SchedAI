

import React, { useState, useEffect, useContext } from 'react';
import {
  GripVertical,
  Send,
  ListOrdered,
  RotateCcw,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Clock,
  Menu,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { AppContext } from '../../context/AppContext';
import { fetchPreferenceCourses, fetchMyPreferences, submitPreferences } from '../../utils/api';
import amritaLogo from '../../assets/amrita_logo.png';

const MAX_PICKS = 3;

const FacultyPreferenceForm = () => {
  const semesterCycle = 'odd';
  const formReleased = true;

  const { loggedInUser } = useContext(AppContext);

  // --- STATE ---
  const [allCourses, setAllCourses] = useState({});     // { semNum: [course, ...] }  — full list
  const [selections, setSelections] = useState({});      // { semNum: [course, ...] }  — picked & ordered (max 3)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);

  // Drag State
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, prefsRes] = await Promise.all([
          fetchPreferenceCourses(semesterCycle),
          fetchMyPreferences(semesterCycle),
        ]);

        const coursesBySem = coursesRes.courses || {};
        setAllCourses(coursesBySem);

        const activeSems = semesterCycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

        if (prefsRes.found && prefsRes.preferences.length > 0) {
          setHasSavedPreferences(true);
          const newSelections = {};
          activeSems.forEach(sem => {
            const semCourses = coursesBySem[sem] || [];
            const savedForSem = prefsRes.preferences
              .filter(p => p.semester === sem)
              .sort((a, b) => a.priority - b.priority)
              .slice(0, MAX_PICKS);

            newSelections[sem] = savedForSem
              .map(saved => semCourses.find(c => c._id === saved.courseId))
              .filter(Boolean);
          });
          setSelections(newSelections);
        } else {
          setHasSavedPreferences(false);
          const empty = {};
          activeSems.forEach(sem => { empty[sem] = []; });
          setSelections(empty);
        }
      } catch (err) {
        console.error('Failed to load preference data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterCycle]);

  // --- HELPERS ---
  const isSelected = (sem, courseId) => (selections[sem] || []).some(c => c._id === courseId);
  const selectionCount = (sem) => (selections[sem] || []).length;

  const toggleCourse = (sem, course) => {
    setSelections(prev => {
      const current = prev[sem] || [];
      const exists = current.some(c => c._id === course._id);
      if (exists) {
        return { ...prev, [sem]: current.filter(c => c._id !== course._id) };
      }
      if (current.length >= MAX_PICKS) return prev; // already at max
      return { ...prev, [sem]: [...current, course] };
    });
  };

  const removeSelection = (sem, courseId) => {
    setSelections(prev => ({
      ...prev,
      [sem]: (prev[sem] || []).filter(c => c._id !== courseId)
    }));
  };

  const resetAll = () => {
    const activeSems = semesterCycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];
    const empty = {};
    activeSems.forEach(sem => { empty[sem] = []; });
    setSelections(empty);
    setIsSubmitted(false);
    setHasSavedPreferences(false);
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const flatPrefs = [];
      Object.entries(selections).forEach(([sem, courseList]) => {
        courseList.forEach((course, index) => {
          flatPrefs.push({
            courseId: course._id,
            semester: Number(sem),
            priority: index + 1,
          });
        });
      });

      if (flatPrefs.length === 0) {
        setError('Please select at least one course before submitting.');
        setSubmitting(false);
        return;
      }

      await submitPreferences({ semesterCycle, preferences: flatPrefs });
      setIsSubmitted(true);
      setHasSavedPreferences(true);
    } catch (err) {
      console.error('Failed to submit preferences:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- DRAG & DROP (within selections only) ---
  const handleDragStart = (e, sem, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sem}-${index}`);
    setTimeout(() => setDraggedItem({ sem, index }), 0);
  };

  const handleDragOver = (e, sem, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedItem || draggedItem.sem !== sem) return;
    if (draggedItem.index === index) { if (dropIndicator !== null) setDropIndicator(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;
    const position = isTop ? 'top' : 'bottom';
    setDropIndicator(prev => {
      if (prev?.sem === sem && prev?.index === index && prev?.position === position) return prev;
      return { sem, index, position };
    });
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropIndicator(null);
  };

  const handleDrop = (e, targetSem) => {
    e.preventDefault();
    if (!draggedItem || !dropIndicator || draggedItem.sem !== targetSem) { handleDragEnd(); return; }
    setSelections(prev => {
      const semPrefs = [...prev[targetSem]];
      const [moved] = semPrefs.splice(draggedItem.index, 1);
      let insertIdx = dropIndicator.index;
      if (draggedItem.index < dropIndicator.index && dropIndicator.position === 'top') insertIdx -= 1;
      if (draggedItem.index > dropIndicator.index && dropIndicator.position === 'bottom') insertIdx += 1;
      semPrefs.splice(insertIdx, 0, moved);
      return { ...prev, [targetSem]: semPrefs };
    });
    handleDragEnd();
  };

  const handleDragEnd = () => { setDraggedItem(null); setDropIndicator(null); };

  const moveUp = (sem, index) => {
    if (index === 0) return;
    setSelections(prev => {
      const arr = [...prev[sem]];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return { ...prev, [sem]: arr };
    });
  };

  const moveDown = (sem, index) => {
    if (index === (selections[sem] || []).length - 1) return;
    setSelections(prev => {
      const arr = [...prev[sem]];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return { ...prev, [sem]: arr };
    });
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <aside className="fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 -translate-x-full lg:translate-x-0">
          <Sidebar onClose={() => { }} />
        </aside>
        <main className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-[#880e4f] animate-spin" />
            <p className="text-gray-500 font-medium">Loading courses...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !Object.keys(allCourses).length) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FA]">
        <aside className="fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 -translate-x-full lg:translate-x-0">
          <Sidebar onClose={() => { }} />
        </aside>
        <main className="flex-1 min-w-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <AlertTriangle size={48} className="text-red-400" />
            <h2 className="text-xl font-bold text-gray-900">Failed to Load Courses</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!formReleased) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-sans">
        <div className="w-24 h-24 bg-white shadow-xl shadow-gray-200/50 rounded-[2rem] flex items-center justify-center mb-8 border border-gray-100">
          <Clock size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Form Closed</h2>
        <p className="text-gray-500 mt-3 text-lg">The preference submission window is currently closed.</p>
      </div>
    );
  }

  const activeSems = semesterCycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden"><img src={amritaLogo} alt="Amrita" className="w-full h-full object-contain" /></div>
            <span className="font-bold text-slate-800">Amrita</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
        </header>

        <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-[#880e4f] rounded-lg"><ListOrdered size={24} /></div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Teaching Preferences</h3>
              </div>
              <p className="text-gray-500 text-sm max-w-lg">
                Select your <strong>top {MAX_PICKS} preferred courses</strong> for each semester, then drag to rank them.
              </p>
              {hasSavedPreferences && !isSubmitted && (
                <p className="text-emerald-600 text-xs font-semibold mt-1">✓ Previously saved preferences loaded</p>
              )}
            </div>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:text-[#880e4f] hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw size={14} /> Clear All
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm font-medium">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {/* Success State */}
          {isSubmitted ? (
            <div className="bg-white border p-16 rounded-[2rem] shadow-xl shadow-gray-200/50 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Preferences Locked</h2>
              <p className="text-gray-500 text-lg mb-8">Your top {MAX_PICKS} priorities have been securely transmitted to the scheduling engine.</p>
              <button onClick={() => setIsSubmitted(false)} className="text-[#880e4f] font-bold text-sm bg-red-50 px-6 py-3 rounded-xl hover:bg-red-100 transition-colors">
                Revise Choices
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {activeSems.map((semNum) => {
                const semCourses = allCourses[semNum] || [];
                if (semCourses.length === 0) return null;
                const semSelections = selections[semNum] || [];
                const count = semSelections.length;
                const isFull = count >= MAX_PICKS;

                return (
                  <div key={semNum} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    {/* Semester header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-red-100 text-[#880e4f] flex items-center justify-center font-black shadow-sm">
                          S{semNum}
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase tracking-widest text-sm">Semester {semNum}</h4>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isFull ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {count}/{MAX_PICKS} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* LEFT: Available Courses */}
                      <div>
                        <h5 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Available Courses</h5>
                        <div className="flex flex-col gap-2">
                          {semCourses.map(course => {
                            const selected = isSelected(semNum, course._id);
                            return (
                              <button
                                key={course._id}
                                onClick={() => toggleCourse(semNum, course)}
                                disabled={!selected && isFull}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 w-full
                                  ${selected
                                    ? 'bg-red-50 border-[#880e4f] shadow-sm'
                                    : isFull
                                      ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                                      : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50/30 cursor-pointer'
                                  }`}
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all
                                  ${selected ? 'bg-[#880e4f] border-[#880e4f] text-white' : 'border-gray-300 text-transparent'}`}>
                                  {selected ? <CheckCircle size={14} /> : <Plus size={14} className="text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="px-1.5 py-[1px] rounded bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest border border-gray-200/50">
                                      {course.code}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-semibold">{course.type}</span>
                                  </div>
                                  <p className="text-[13px] font-bold text-gray-800 truncate">{course.title}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{course.credits} Credits • L-T-P: {course.ltp}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* RIGHT: Ranked Selections */}
                      <div>
                        <h5 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                          Your Top {MAX_PICKS} — Drag to Rank
                        </h5>
                        {semSelections.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                            <p className="text-gray-400 text-sm font-medium">Select courses from the left to rank them</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {semSelections.map((course, index) => {
                              const isDragged = draggedItem?.sem === semNum && draggedItem?.index === index;
                              const isDropTarget = dropIndicator?.sem === semNum && dropIndicator?.index === index && !isDragged;
                              return (
                                <div
                                  key={course._id}
                                  className="relative group select-none"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, semNum, index)}
                                  onDragOver={(e) => handleDragOver(e, semNum, index)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, semNum)}
                                  onDragEnd={handleDragEnd}
                                >
                                  {isDropTarget && dropIndicator.position === 'top' && (
                                    <div className="absolute -top-[5px] left-0 right-0 h-1.5 bg-[#880e4f] rounded-full z-10 shadow-[0_0_12px_rgba(136,14,79,0.8)] pointer-events-none" />
                                  )}
                                  <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-150
                                    ${isDragged
                                      ? 'bg-gray-50 opacity-40 border-2 border-dashed border-red-300 scale-[0.98]'
                                      : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 cursor-grab active:cursor-grabbing'
                                    }`}>
                                    <div className="text-gray-300"><GripVertical size={18} /></div>
                                    <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-base border
                                      ${index === 0 ? 'bg-[#fef2f2] text-[#880e4f] border-[#fecaca]' : index === 1 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0 pointer-events-none">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="px-1.5 py-[1px] rounded bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest">{course.code}</span>
                                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                                          • {index === 0 ? <span className="text-[#880e4f]">Top Choice</span> : `Choice ${index + 1}`}
                                        </span>
                                      </div>
                                      <p className="text-[13px] font-bold text-gray-800 truncate">{course.title}</p>
                                    </div>
                                    {/* Controls */}
                                    <div className="flex items-center gap-1 pointer-events-auto">
                                      <button onClick={(e) => { e.stopPropagation(); moveUp(semNum, index); }} disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-[#880e4f] hover:bg-red-50 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                                        <ChevronUp size={16} />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); moveDown(semNum, index); }} disabled={index === semSelections.length - 1}
                                        className="p-1 text-gray-400 hover:text-[#880e4f] hover:bg-red-50 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                                        <ChevronDown size={16} />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); removeSelection(semNum, course._id); }}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-1">
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  {isDropTarget && dropIndicator.position === 'bottom' && (
                                    <div className="absolute -bottom-[5px] left-0 right-0 h-1.5 bg-[#880e4f] rounded-full z-10 shadow-[0_0_12px_rgba(136,14,79,0.8)] pointer-events-none" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Submit */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-[#8B0000] text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-4px_rgba(136,14,79,0.4)] hover:bg-[#6a0a3d] hover:shadow-[0_12px_24px_-4px_rgba(136,14,79,0.5)] flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Send size={20} /> Finalize Priority Form</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FacultyPreferenceForm;