import { DAYS } from './constants';

export const buildCompletedEntries = (facultyReport) =>
  facultyReport?.entries?.filter((entry) => entry.status === 'Completed') || [];

export const buildChartData = (facultyReport) => {
  return DAYS.map((day) => {
    const entries = facultyReport?.byDay?.[day] || [];

    const completedTeaching = entries.filter(
      (entry) => entry.status === 'Completed' && entry.isTeaching
    );

    const theory = completedTeaching
      .filter((entry) => entry.classType === 'Theory')
      .reduce((sum, entry) => sum + (entry.hours || 1), 0);

    const lab = completedTeaching
      .filter((entry) => entry.classType === 'Lab')
      .reduce((sum, entry) => sum + (entry.hours || 1), 0);

    const admin = entries
      .filter((entry) => !entry.isTeaching && entry.status === 'Completed')
      .reduce((sum, entry) => sum + (entry.hours || 1), 0);

    return {
      name: day.substring(0, 3),
      theory,
      lab,
      admin,
    };
  });
};

export const calculateTotals = (completedEntries = []) => {
  return completedEntries.reduce(
    (acc, entry) => {
      const hours = entry.hours || 1;
      if (!entry.isTeaching) {
        acc.totalAdmin += hours;
        acc.totalHours += hours;
        return acc;
      }

      if (entry.classType === 'Lab') {
        acc.totalLab += hours;
      } else {
        acc.totalTheory += hours;
      }
      acc.totalHours += hours;
      return acc;
    },
    { totalTheory: 0, totalLab: 0, totalAdmin: 0, totalHours: 0 }
  );
};
