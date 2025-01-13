export const getCurrentWeekDates = () => {
  const currentDate = new Date();
  const startOfWeek = currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1);
  return Array.from({ length: 7 }, (_, i) => {
    const weekDate = new Date();
    weekDate.setDate(startOfWeek + i);
    weekDate.setHours(0, 0, 0, 0);
    return weekDate;
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '/');
};

export const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const getTimeFrameDates = (timeFrame) => {
  const now = new Date();
  const startOfPeriod = new Date(now);
  let endOfPeriod = new Date(now);

  if (timeFrame === 'week') {
    startOfPeriod.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfPeriod.setHours(0, 0, 0, 0);
    endOfPeriod = new Date(startOfPeriod);
    endOfPeriod.setDate(startOfPeriod.getDate() + 6);
    endOfPeriod.setHours(23, 59, 59, 999);
  } else if (timeFrame === 'month') {
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);
    endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    // day
    startOfPeriod.setHours(0, 0, 0, 0);
    endOfPeriod.setHours(23, 59, 59, 999);
  }

  return { startOfPeriod, endOfPeriod };
};