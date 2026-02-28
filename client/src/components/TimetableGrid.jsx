import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DAYS, SLOTS } from '../utils/constants';

// Get ISO week number for a date
const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Determine Saturday status for the current week
const getSaturdayInfo = () => {
  const now = new Date();
  const weekNum = getISOWeekNumber(now);
  const isWorkingSaturday = weekNum % 2 === 0; // Even weeks = working
  // Rotate through weekdays: week 2→Mon, week 4→Tue, week 6→Wed, ...
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const mirrorDay = isWorkingSaturday ? WEEKDAYS[((weekNum / 2) - 1) % 5] : null;
  return { isWorkingSaturday, mirrorDay, weekNum };
};

const TimetableGrid = ({
  title,
  schedule,
  selectedEntity,
  onEntityChange,
  entityList = [],
  entityLabel,
  selectorLocked = false,
  mentorInfo = null,
}) => {
  const currentDay = DAYS[new Date().getDay() - 1] || 'Monday';
  const saturdayInfo = getSaturdayInfo();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">View and manage schedules</p>
        </div>

        <div className="flex items-center gap-4">
          {mentorInfo && (
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-400">Mentor:</span>
              <span className="text-sm font-bold text-indigo-700">{mentorInfo}</span>
            </div>
          )}
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-500">{entityLabel}:</span>
            {selectorLocked ? (
              <span className="text-base font-bold text-gray-900">{selectedEntity}</span>
            ) : (
              <div className="relative">
                <select
                  value={selectedEntity}
                  onChange={(e) => onEntityChange(e.target.value)}
                  className="bg-transparent text-gray-900 font-bold focus:outline-none pr-8 appearance-none cursor-pointer"
                >
                  {entityList.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 w-32 bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 sticky left-0 z-10">Time</th>
                {DAYS.map(day => {
                  const isSaturday = day === 'Saturday';
                  const isToday = day === currentDay;
                  return (
                    <th key={day} className={`
                      p-4 text-center text-xs font-bold uppercase tracking-wider border-b border-gray-100 min-w-[140px]
                      ${isToday ? 'text-[#A41034] bg-red-50/50' : isSaturday && !saturdayInfo.isWorkingSaturday ? 'text-red-400 bg-red-50/30' : 'text-gray-400 bg-gray-50'}
                    `}>
                      {isToday ? (
                        <div className="flex flex-col">
                          <span>{day}</span>
                          <span className="text-[10px] opacity-70 mt-1">TODAY</span>
                        </div>
                      ) : isSaturday ? (
                        <div className="flex flex-col items-center gap-1">
                          <span>{day}</span>
                          {saturdayInfo.isWorkingSaturday ? (
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              Follows {saturdayInfo.mirrorDay}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              HOLIDAY
                            </span>
                          )}
                        </div>
                      ) : day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {SLOTS.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <tr key={slot.id} className="bg-gray-50/50">
                      <td className="p-3 sticky left-0 bg-gray-50 z-10 border-r border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-300">{slot.start}</span>
                          <span className="text-[10px] font-bold text-gray-300 uppercase mt-1">{slot.label}</span>
                        </div>
                      </td>
                      <td colSpan={6} className="p-2 text-center text-xs font-bold text-gray-300 tracking-[0.2em] uppercase">
                        {slot.label}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-4 border-r border-gray-100 sticky left-0 bg-white z-10 group-hover:bg-gray-50/30">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800">{slot.start}</span>
                        <span className="text-xs font-medium text-gray-400 uppercase">{slot.label}</span>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const isSaturday = day === 'Saturday';

                      // For Saturday: on holiday weeks, show holiday; on working weeks, mirror the weekday
                      if (isSaturday && !saturdayInfo.isWorkingSaturday) {
                        return (
                          <td key={day} className="p-2 border-r border-gray-50 last:border-0 align-top h-32">
                            <div className="h-full w-full rounded-xl flex items-center justify-center bg-red-50/40 border border-dashed border-red-200">
                              <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Holiday</span>
                            </div>
                          </td>
                        );
                      }

                      // For working Saturday, pull schedule from the mirrored weekday
                      const lookupDay = isSaturday && saturdayInfo.isWorkingSaturday ? saturdayInfo.mirrorDay : day;

                      // Try both the slot.id directly and as a string to match API grid keys
                      const course = schedule[lookupDay]?.[slot.id] || schedule[lookupDay]?.[String(slot.id)];
                      const isCancelled = course?.status === 'CANCELLED';
                      const isExtra = course?.status === 'EXTRA';
                      const isRescheduled = course?.status === 'RESCHEDULED';

                      return (
                        <td key={day} className={`p-2 border-r border-gray-50 last:border-0 align-top h-32 ${isCancelled ? 'bg-red-50/20' : ''}`}>
                          {course ? (
                            <div className={`
                              h-full w-full rounded-xl p-3 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-sm relative overflow-hidden
                              ${isCancelled ? 'bg-red-100/50 text-red-500 border border-red-200' : course.color}
                              ${(isExtra || isRescheduled) ? 'ring-2 ring-offset-1 ' + (isExtra ? 'ring-green-400' : 'ring-purple-400') : ''}
                            `}>
                              {(isExtra || isRescheduled) && (
                                <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-bold text-white uppercase rounded-bl-lg ${isExtra ? 'bg-green-500' : 'bg-purple-500'}`}>
                                  {isExtra ? 'Extra' : 'Rescheduled'}
                                </div>
                              )}

                              <div className="flex justify-between items-start">
                                <span className={`font-extrabold text-xs tracking-tight ${isCancelled ? 'line-through opacity-70' : ''}`}>{course.code}</span>
                                {isCancelled && <span className="text-[10px] font-bold bg-red-200 text-red-700 px-1.5 py-0.5 rounded">CANCELLED</span>}
                                {!isCancelled && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>}
                              </div>
                              <div className={`font-bold text-sm leading-tight my-1 line-clamp-2 ${isCancelled ? 'line-through opacity-70' : ''}`}>
                                {course.name}
                              </div>

                              {/* Show faculty name in section timetable */}
                              {mentorInfo !== null && course.faculty && (
                                <div className="text-[10px] font-semibold opacity-75 -mt-0.5 mb-0.5">
                                  {course.faculty}
                                </div>
                              )}

                              {course.reason && (
                                <div className="text-[10px] font-medium opacity-90 mt-auto pt-1 border-t border-black/10">
                                  {course.reason}
                                </div>
                              )}

                              {!course.reason && (
                                <div className="text-[10px] font-bold bg-white/40 self-start px-2 py-1 rounded text-current backdrop-blur-sm">
                                  {course.room}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-gray-100 text-2xl font-light">+</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
