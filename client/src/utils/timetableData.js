import { INITIAL_EVENTS, DAYS, SLOTS } from "./constants";

/**
 * Class Status System:
 * - 'scheduled': Default state for planned classes (not yet taught)
 * - 'completed': Class has been successfully conducted (counts in reports)
 * - 'cancelled': Class was cancelled (excluded from reports)
 * 
 * Important: Reports only count 'completed' classes for accurate tracking
 * of syllabus progress, attendance, and workload metrics.
 * 
 * Automatic Completion:
 * Classes are automatically marked as 'completed' when their time slot ends.
 * This happens through periodic checks every minute.
 */

// Deep clone of INITIAL_EVENTS with stable ids and default status added
export const getInitialTimetable = () => {
  const result = {};
  Object.entries(INITIAL_EVENTS).forEach(([day, list]) => {
    result[day] = (list || []).map((e, index) => ({
      // preserve existing id if present, otherwise generate
      id: e.id || `${day}-${e.slotId}-${index}`,
      // add default status if not present
      status: e.status || 'scheduled',
      ...e,
    }));
  });
  return result;
};

// Check if a given slot on a given day has no active class
export const isSlotFree = (events, day, slotId, ignoreEventId) => {
  const dayEvents = events[day] || [];
  return !dayEvents.some(
    (e) => !e.isCancelled && e.slotId === slotId && e.id !== ignoreEventId
  );
};

// Check if a room is free for the given slot across the teacher's timetable
export const isRoomAvailable = (events, slotId, room, ignoreEventId) => {
  for (const day of Object.keys(events)) {
    const dayEvents = events[day] || [];
    if (
      dayEvents.some(
        (e) =>
          !e.isCancelled &&
          e.slotId === slotId &&
          e.room === room &&
          e.id !== ignoreEventId
      )
    ) {
      return false;
    }
  }
  return true;
};

export const canScheduleClass = (events, day, slotId, room, ignoreEventId) => {
  const slotFree = isSlotFree(events, day, slotId, ignoreEventId);
  const roomFree = isRoomAvailable(events, slotId, room, ignoreEventId);
  return { slotFree, roomFree, ok: slotFree && roomFree };
};

// Add a new class to the timetable, enforcing constraints
export const addClassToTimetable = (events, day, newEvent) => {
  const { slotId, room } = newEvent;
  const check = canScheduleClass(events, day, slotId, room);
  if (!check.ok) {
    return {
      events,
      error: !check.slotFree
        ? "Slot already has a class for this teacher."
        : "Room is not available for this slot.",
    };
  }

  // Add default status to new event
  const eventWithStatus = { ...newEvent, status: newEvent.status || 'scheduled' };
  const updatedDayEvents = [...(events[day] || []), eventWithStatus];
  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Mark a class as completed
export const markClassAsCompleted = (events, day, id) => {
  const updatedDayEvents = (events[day] || []).map((e) =>
    e.id === id ? { ...e, status: 'completed', isCancelled: false } : e
  );

  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Mark a class as cancelled (does not remove it)
export const markClassAsCancelled = (events, day, id, scope = "Today") => {
  const updatedDayEvents = (events[day] || []).map((e) =>
    e.id === id ? { ...e, status: 'cancelled', isCancelled: true, cancelScope: scope } : e
  );

  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Restore a class to scheduled state
export const markClassAsScheduled = (events, day, id) => {
  const updatedDayEvents = (events[day] || []).map((e) =>
    e.id === id ? { ...e, status: 'scheduled', isCancelled: false, cancelScope: null } : e
  );

  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Legacy function - use markClassAsCancelled instead
export const cancelClassInTimetable = markClassAsCancelled;

// Legacy function - use markClassAsScheduled instead
export const restoreClassInTimetable = markClassAsScheduled;

// Shift a class to a new day/slot (and optionally new room)
export const shiftClassInTimetable = (
  events,
  id,
  oldDay,
  { newDay, newSlotId, scope = "Today", room: overrideRoom }
) => {
  if (!newDay || !newSlotId) {
    return { events, error: "Target day and slot are required." };
  }

  const sourceEvents = [...(events[oldDay] || [])];
  const eventIndex = sourceEvents.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return { events, error: "Class not found in source day." };
  }

  const movedEvent = sourceEvents[eventIndex];
  const targetRoom = overrideRoom || movedEvent.room;

  const check = canScheduleClass(events, newDay, newSlotId, targetRoom, id);
  if (!check.ok) {
    return {
      events,
      error: !check.slotFree
        ? "Target slot already has a class."
        : "Room is not available at target slot.",
    };
  }

  // Remove from old day
  sourceEvents.splice(eventIndex, 1);

  const targetEvents = [...(events[newDay] || [])];
  const updatedEvent = {
    ...movedEvent,
    slotId: newSlotId,
    room: targetRoom,
    scope,
    status: 'scheduled',
    isCancelled: false,
  };
  targetEvents.push(updatedEvent);

  return {
    events: {
      ...events,
      [oldDay]: sourceEvents,
      [newDay]: targetEvents,
    },
    error: null,
  };
};

/**
 * Check if a specific day and slot time has passed
 * @param {string} day - Day name (Monday, Tuesday, etc.)
 * @param {number|string} slotId - Slot ID from SLOTS
 * @param {Date} currentTime - Current date/time
 * @returns {boolean} - True if the class time has ended
 */
export const hasClassTimePassed = (day, slotId, currentTime = new Date()) => {
  // Get current day index (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = currentTime.getDay();
  const currentDayName = DAYS[currentDayIndex - 1] || (currentDayIndex === 6 ? "Saturday" : null);
  
  // Find the day index for the class
  const classDayIndex = DAYS.indexOf(day);
  if (classDayIndex === -1) return false;
  
  // Find the slot
  const slot = SLOTS.find(s => s.id === slotId);
  if (!slot || slot.isBreak) return false;
  
  // If class is on a future day this week, it hasn't happened
  if (classDayIndex > DAYS.indexOf(currentDayName)) return false;
  
  // If class is on a past day this week, it has happened
  if (classDayIndex < DAYS.indexOf(currentDayName)) return true;
  
  // Same day - check time
  const [endHour, endMinute] = slot.end.split(':').map(Number);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const slotEndMinutes = endHour * 60 + endMinute;
  
  return currentMinutes >= slotEndMinutes;
};

/**
 * Automatically mark scheduled classes as completed if their time has passed
 * @param {Object} events - Timetable events object
 * @param {Date} currentTime - Current date/time
 * @returns {Object} - Updated events object
 */
export const autoMarkCompletedClasses = (events, currentTime = new Date()) => {
  const updatedEvents = { ...events };
  let hasChanges = false;
  
  Object.keys(updatedEvents).forEach(day => {
    const dayEvents = updatedEvents[day] || [];
    const updatedDayEvents = dayEvents.map(event => {
      // Only auto-complete scheduled classes (not cancelled or already completed)
      if (event.status === 'scheduled' && hasClassTimePassed(day, event.slotId, currentTime)) {
        hasChanges = true;
        return { ...event, status: 'completed' };
      }
      return event;
    });
    
    if (hasChanges) {
      updatedEvents[day] = updatedDayEvents;
    }
  });
  
  return hasChanges ? updatedEvents : events;
};
