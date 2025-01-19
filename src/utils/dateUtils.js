// src/utils/dateUtils.js

export const getCurrentWeekDates = () => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Get current day (0-6, where 0 is Sunday)
  const currentDay = currentDate.getDay();
  
  // Calculate the date of Monday (start of week)
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);
  
  // Generate array of dates for the week (Monday to Sunday)
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    date.setHours(0, 0, 0, 0);
    weekDates.push(date);
  }
  
  return weekDates;
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
    const weekDates = getCurrentWeekDates();
    startOfPeriod.setTime(weekDates[0].getTime());
    endOfPeriod.setTime(weekDates[6].getTime());
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

export const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isDateInCurrentWeek = (dateToCheck) => {
  const weekDates = getCurrentWeekDates();
  const startOfWeek = normalizeDate(weekDates[0]); // Monday
  const endOfWeek = new Date(weekDates[6]); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);
  
  const checkDate = normalizeDate(new Date(dateToCheck));
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

export const getDayNumber = (date) => {
  const day = new Date(date).getDay();
  // Convert Sunday (0) to 7, keep other days as is (1-6 for Mon-Sat)
  return day === 0 ? 7 : day;
};