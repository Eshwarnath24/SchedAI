const CLASS_TYPE_BADGES = {
  Theory: 'info',
  Lab: 'warning',
  Extra: 'success',
  Substitute: 'danger',
};

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 18 * 60;

const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const minutesToTimeLabel = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined) return 'TBD';
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDurationLabel = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
  if (hours) return `${hours} hr${hours > 1 ? 's' : ''}`;
  if (mins) return `${mins} min`;
  return '0 min';
};

export const getEntryBadgeType = (entry) => {
  if (!entry?.isTeaching) return 'neutral';
  return CLASS_TYPE_BADGES[entry.classType] || 'info';
};

export const buildFreeSlotInsight = (entries = []) => {
  const teachingBlocks = entries
    .filter((entry) => entry.isTeaching && entry.timeStart && entry.timeEnd)
    .map((entry) => ({
      start: timeStringToMinutes(entry.timeStart),
      end: timeStringToMinutes(entry.timeEnd),
    }))
    .filter((slot) => slot.start !== null && slot.end !== null)
    .sort((a, b) => a.start - b.start);

  if (teachingBlocks.length === 0) {
    return {
      rangeLabel: `${minutesToTimeLabel(DAY_START_MINUTES)} - ${minutesToTimeLabel(DAY_END_MINUTES)}`,
      durationLabel: 'Full day open',
      suggestion: 'No classes are scheduled today. Use the time for mentoring, research, or curriculum planning.',
    };
  }

  const candidateGaps = [];
  const firstGap = teachingBlocks[0].start - DAY_START_MINUTES;
  if (firstGap >= 45) candidateGaps.push({ start: DAY_START_MINUTES, end: teachingBlocks[0].start });

  for (let i = 0; i < teachingBlocks.length - 1; i += 1) {
    const gap = teachingBlocks[i + 1].start - teachingBlocks[i].end;
    if (gap >= 45) {
      candidateGaps.push({ start: teachingBlocks[i].end, end: teachingBlocks[i + 1].start });
    }
  }

  const lastGap = DAY_END_MINUTES - teachingBlocks[teachingBlocks.length - 1].end;
  if (lastGap >= 45) candidateGaps.push({ start: teachingBlocks[teachingBlocks.length - 1].end, end: DAY_END_MINUTES });

  if (candidateGaps.length === 0) return null;

  const bestGap = candidateGaps[0];
  const duration = bestGap.end - bestGap.start;
  return {
    rangeLabel: `${minutesToTimeLabel(bestGap.start)} - ${minutesToTimeLabel(bestGap.end)}`,
    durationLabel: formatDurationLabel(duration),
    suggestion: 'Ideal window for grading, lab prep, or 1:1 mentoring.',
  };
};

export const buildLocationSummary = (entries = []) => {
  const grouped = entries
    .filter((entry) => entry.isTeaching && entry.room)
    .reduce((acc, entry) => {
      const key = entry.classType || 'Session';
      if (!acc[key]) acc[key] = new Set();
      acc[key].add(entry.room);
      return acc;
    }, {});

  return Object.entries(grouped)
    .slice(0, 4)
    .map(([type, rooms]) => ({
      id: type,
      label: `${type} slots`,
      rooms: Array.from(rooms).join(', '),
    }));
};

export const buildEngagementStats = (report, extraEntries = []) => {
  const maxHours = report.maxWeeklyHours || 0;
  const teachingLoadPct = maxHours
    ? Math.round((report.totalTeachingHours / maxHours) * 100)
    : 0;
  const coreHours = report.totalTheoryHours + report.totalLabHours;
  const labShare = coreHours
    ? Math.round((report.totalLabHours / coreHours) * 100)
    : 0;
  const consecutiveAlert = report.consecutiveWarnings?.[0];

  const stats = [
    {
      label: 'Teaching Load',
      value: `${Math.min(teachingLoadPct, 150)}%`,
      detail: `${report.totalTeachingHours}h of ${maxHours || report.totalTeachingHours || 0}h allocated`,
      accent: 'text-emerald-600',
    },
    {
      label: 'Lab Coverage',
      value: coreHours ? `${labShare}%` : '0%',
      detail: `${report.totalLabHours}h labs / ${coreHours || 0}h core`,
      accent: 'text-indigo-600',
    },
    {
      label: 'Extra Sessions',
      value: `${extraEntries.length}`,
      detail: `${report.totalExtraHours}h recorded outside timetable`,
      accent: 'text-rose-600',
    },
  ];

  if (consecutiveAlert) {
    stats.push({
      label: 'Long Streak',
      value: `${consecutiveAlert.count} slots`,
      detail: `${consecutiveAlert.day}: slots ${consecutiveAlert.from} - ${consecutiveAlert.to}`,
      accent: 'text-amber-600',
    });
  }

  return stats;
};

export const buildLeaveImpacts = (cancelledEntries = []) =>
  cancelledEntries.slice(0, 3).map((entry) => ({
    id: entry.id || `${entry.day}-${entry.slotId}`,
    timeRange:
      entry.timeStart && entry.timeEnd
        ? `${entry.timeStart} - ${entry.timeEnd}`
        : entry.slotLabel || 'Scheduled Slot',
    courseName: entry.courseName || entry.courseCode || 'Class Session',
    section: entry.section,
    reason: entry.reason || 'Cancellation noted',
  }));
