

import React, { useState, useEffect } from 'react';
import {
  GripVertical,
  Send,
  ListOrdered,
  RotateCcw,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Clock,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';


const FacultyPreferenceForm = () => {
  // --- CONFIGURATION (Usually passed from Admin/Backend) ---
  const semesterCycle = 'odd'; // 'odd' (1,3,5,7) or 'even' (2,4,6,8)
  const formReleased = true; // If false, shows "Form Closed" screen

  // --- MOCK DATA ---
  const [courses] = useState([
    { id: 'c1', code: '19CSE301', title: 'Operating Systems', ltp: '3-0-2', credits: 4, sem: 5 },
    { id: 'c2', code: '19CSE302', title: 'Database Management', ltp: '3-0-2', credits: 4, sem: 5 },
    { id: 'c3', code: '19MAT201', title: 'Complex Analysis', ltp: '3-1-0', credits: 4, sem: 3 },
    { id: 'c4', code: '19CSE101', title: 'Problem Solving', ltp: '2-0-4', credits: 4, sem: 1 },
    { id: 'c5', code: '19CSE401', title: 'Artificial Intelligence', ltp: '3-0-0', credits: 3, sem: 7 },
    { id: 'c6', code: '19CSE211', title: 'Computer Organization', ltp: '3-1-0', credits: 4, sem: 3 },
    { id: 'c7', code: '19CSE111', title: 'Digital Electronics', ltp: '3-0-2', credits: 4, sem: 1 },
  ]);

  // --- STATE MANAGEMENT ---
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [preferences, setPreferences] = useState({}); // Grouped by semester: { 1: [...], 3: [...] }

  // Drag State: Tracks Semester AND Index
  const [draggedItem, setDraggedItem] = useState(null); // { sem: number, index: number }
  const [dropIndicator, setDropIndicator] = useState(null); // { sem: number, index: number, position: 'top' | 'bottom' }

  // --- INITIALIZATION ---
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    resetToDefault();
    setIsSubmitted(false);
    // eslint-disable-next-line
  }, [semesterCycle, courses]);

  // Reset preferences to default order for active semesters
  const resetToDefault = () => {
    const activeSems = semesterCycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];
    const newPrefs = {};
    activeSems.forEach((sem) => {
      newPrefs[sem] = courses.filter((c) => c.sem === sem);
    });
    setPreferences(newPrefs);
  };

  // --- DRAG & DROP HANDLERS ---
  // Handles drag start for a course card
  const handleDragStart = (e, sem, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sem}-${index}`);
    setTimeout(() => setDraggedItem({ sem, index }), 0);
  };


  // Handles drag over a course card
  const handleDragOver = (e, sem, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Only allow dragging within the same semester
    if (!draggedItem || draggedItem.sem !== sem) return;
    // Ignore if hovering over itself
    if (draggedItem.index === index) {
      if (dropIndicator !== null) setDropIndicator(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;
    const position = isTop ? 'top' : 'bottom';
    setDropIndicator((prev) => {
      if (prev?.sem === sem && prev?.index === index && prev?.position === position) return prev;
      return { sem, index, position };
    });
  };

  // Handles drag leave event
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropIndicator(null);
    }
  };

  // Handles drop event for a course card
  // eslint-disable-next-line no-unused-vars
  const handleDrop = (e, targetSem, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || !dropIndicator || draggedItem.sem !== targetSem) {
      handleDragEnd();
      return;
    }
    setPreferences((prev) => {
      const semPrefs = [...prev[targetSem]];
      const [movedCourse] = semPrefs.splice(draggedItem.index, 1);
      let insertIdx = dropIndicator.index;
      // Adjust insertion index based on drag direction
      if (draggedItem.index < dropIndicator.index && dropIndicator.position === 'top') insertIdx -= 1;
      if (draggedItem.index > dropIndicator.index && dropIndicator.position === 'bottom') insertIdx += 1;
      semPrefs.splice(insertIdx, 0, movedCourse);
      return { ...prev, [targetSem]: semPrefs };
    });
    handleDragEnd();
  };

  // Handles drag end event
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropIndicator(null);
  };

  // --- MANUAL CONTROLS (UP/DOWN) ---
  // Move course up in the list
  const moveUp = (sem, index) => {
    if (index === 0) return;
    setPreferences((prev) => {
      const semPrefs = [...prev[sem]];
      [semPrefs[index - 1], semPrefs[index]] = [semPrefs[index], semPrefs[index - 1]];
      return { ...prev, [sem]: semPrefs };
    });
  };

  // Move course down in the list
  const moveDown = (sem, index) => {
    if (index === preferences[sem].length - 1) return;
    setPreferences((prev) => {
      const semPrefs = [...prev[sem]];
      [semPrefs[index], semPrefs[index + 1]] = [semPrefs[index + 1], semPrefs[index]];
      return { ...prev, [sem]: semPrefs };
    });
  };

  // --- RENDER ---

  // Show closed form state if not released
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

  // Determine active semesters
  const activeSems = semesterCycle === 'odd' ? [1, 3, 5, 7] : [2, 4, 6, 8];

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Fixed Sidebar for large screens */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-72 z-30">
        <Sidebar />
      </div>
      {/* Main content with left margin for sidebar */}
      <div className="lg:ml-72">
        <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans text-gray-900 p-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-[#880e4f] rounded-lg">
                  <ListOrdered size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Teaching Preferences</h3>
              </div>
              <p className="text-gray-500 text-sm max-w-lg">
                Rank your preferred courses <strong>independently for each semester</strong>. Drag the handle or use arrows to reorder.
              </p>
            </div>
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:text-[#880e4f] hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw size={14} /> Reset All Orders
            </button>
          </div>

          {/* Submission Success State */}
          {isSubmitted ? (
            <div className="bg-white border p-16 rounded-[2rem] shadow-xl shadow-gray-200/50 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Preferences Locked</h2>
              <p className="text-gray-500 text-lg mb-8">Your priorities have been securely transmitted to the scheduling engine.</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[#880e4f] font-bold text-sm bg-red-50 px-6 py-3 rounded-xl hover:bg-red-100 transition-colors"
              >
                Revise Choices
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-inner space-y-8">
              {/* SEMESTER GROUPS */}
              {activeSems.map((semNum) => {
                const semCourses = preferences[semNum] || [];
                if (semCourses.length === 0) return null;
                return (
                  <div key={semNum} className="space-y-3">
                    <div className="flex items-center gap-3 mb-4 pl-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-red-100 text-[#880e4f] flex items-center justify-center font-black shadow-sm">
                        S{semNum}
                      </div>
                      <h4 className="font-bold text-gray-900 uppercase tracking-widest text-sm">Semester {semNum} Priorities</h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {semCourses.map((course, index) => {
                        // Drag/drop and highlight logic
                        const isDragged = draggedItem?.sem === semNum && draggedItem?.index === index;
                        const isDropTarget = dropIndicator?.sem === semNum && dropIndicator?.index === index && !isDragged;
                        return (
                          <div
                            key={course.id}
                            className="relative group select-none"
                            draggable
                            onDragStart={(e) => handleDragStart(e, semNum, index)}
                            onDragOver={(e) => handleDragOver(e, semNum, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, semNum, index)}
                            onDragEnd={handleDragEnd}
                          >
                            {/* Drop indicator (top) */}
                            {isDropTarget && dropIndicator.position === 'top' && (
                              <div className="absolute -top-[7.5px] left-0 right-0 h-1.5 bg-[#880e4f] rounded-full z-10 shadow-[0_0_12px_rgba(136,14,79,0.8)] pointer-events-none" />
                            )}
                            {/* Course card */}
                            <div
                              className={`
                                flex items-center justify-between p-4 rounded-2xl transition-all duration-150
                                ${isDragged
                                  ? 'bg-gray-50 opacity-40 border-2 border-dashed border-red-300 scale-[0.99] grayscale-[20%]'
                                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 cursor-grab active:cursor-grabbing'
                                }
                              `}
                            >
                              {/* Drag handle & info */}
                              <div className="flex items-center gap-4 flex-1 pointer-events-none">
                                <div className="text-gray-300 transition-colors ml-1">
                                  <GripVertical size={20} />
                                </div>
                                <div
                                  className={`
                                    w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] font-black text-xl border
                                    ${index === 0 ? 'bg-[#fef2f2] text-[#880e4f] border-[#fecaca]' : 'bg-gray-50 text-gray-400 border-gray-100'}
                                  `}
                                >
                                  {index + 1}
                                </div>
                                <div className="ml-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-[2px] rounded bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest border border-gray-200/50">
                                      {course.code}
                                    </span>
                                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest px-1">
                                      • {index === 0 ? <span className="text-[#880e4f]">Top Choice</span> : `Priority ${index + 1}`}
                                    </span>
                                  </div>
                                  <h4 className="text-[15px] font-bold text-gray-900 leading-tight truncate">{course.title}</h4>
                                  <p className="text-[11px] text-gray-500 font-medium mt-1">
                                    {course.credits} Credits <span className="mx-2 text-gray-300">•</span> L-T-P: {course.ltp}
                                  </p>
                                </div>
                              </div>
                              {/* Up/down buttons */}
                              <div className="flex flex-col items-center gap-1 border-l pl-4 border-gray-100 pointer-events-auto">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveUp(semNum, index); }}
                                  disabled={index === 0}
                                  className="p-1.5 text-gray-400 hover:text-[#880e4f] hover:bg-red-50 rounded-md disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                                >
                                  <ChevronUp size={18} />
                                </button>
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveDown(semNum, index); }}
                                  disabled={index === preferences[semNum].length - 1}
                                  className="p-1.5 text-gray-400 hover:text-[#880e4f] hover:bg-red-50 rounded-md disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                                >
                                  <ChevronDown size={18} />
                                </button>
                              </div>
                            </div>
                            {/* Drop indicator (bottom) */}
                            {isDropTarget && dropIndicator.position === 'bottom' && (
                              <div className="absolute -bottom-[7.5px] left-0 right-0 h-1.5 bg-[#880e4f] rounded-full z-10 shadow-[0_0_12px_rgba(136,14,79,0.8)] pointer-events-none" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Submit button */}
              <div className="pt-6 mt-4 border-t border-dashed border-gray-200">
                <button
                  onClick={() => setIsSubmitted(true)}
                  className="w-full py-4 bg-[#880e4f] text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_-4px_rgba(136,14,79,0.4)] hover:bg-[#6a0a3d] hover:shadow-[0_12px_24px_-4px_rgba(136,14,79,0.5)] flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200"
                >
                  <Send size={20} /> Finalize Priority Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyPreferenceForm;