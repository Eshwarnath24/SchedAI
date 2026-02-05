import { INITIAL_EVENTS } from "./constants";

// Deep clone of INITIAL_EVENTS with stable ids added
export const getInitialTimetable = () => {
  const result = {};
  Object.entries(INITIAL_EVENTS).forEach(([day, list]) => {
    result[day] = (list || []).map((e, index) => ({
      // preserve existing id if present, otherwise generate
      id: e.id || `${day}-${e.slotId}-${index}`,
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

  const updatedDayEvents = [...(events[day] || []), newEvent];
  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Mark a class as cancelled (does not remove it)
export const cancelClassInTimetable = (events, day, id, scope = "Today") => {
  const updatedDayEvents = (events[day] || []).map((e) =>
    e.id === id ? { ...e, isCancelled: true, cancelScope: scope } : e
  );

  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

// Restore a previously cancelled class
export const restoreClassInTimetable = (events, day, id) => {
  const updatedDayEvents = (events[day] || []).map((e) =>
    e.id === id ? { ...e, isCancelled: false, cancelScope: null } : e
  );

  return {
    events: {
      ...events,
      [day]: updatedDayEvents,
    },
    error: null,
  };
};

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
