import { convertDurationToMinutes } from './durationUtils';
import { getCurrentWeekDates, normalizeDate } from './dateUtils';

export const MONTHS_TO_SHOW = 25; // 12 months before and after current month
export const ITEM_HEIGHT = 420; // Increased height for month items
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const generateMonthsData = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  return Array.from({ length: MONTHS_TO_SHOW }, (_, index) => {
    const offset = index - 12;
    const monthDate = new Date(currentYear, currentMonth + offset, 1);
    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      label: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    };
  }).reverse();
};

export const generateCalendarData = (year, month, dateEntries, dateStatuses) => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  
  // Get day of week (0-6, where 0 is Sunday)
  let firstDayOfMonth = startOfMonth.getDay();
  // Convert Sunday from 0 to 7 for our Monday-based week
  firstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pre-calculate padding days
  const paddingDays = Array.from({ length: firstDayOfMonth - 1 }, (_, index) => ({
    key: `padding-start-${index}`,
    isPadding: true
  }));

  // Generate actual days
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const currentDate = new Date(year, month, index + 1);
    currentDate.setHours(0, 0, 0, 0);
    const normalizedDate = currentDate.getTime();
    
    return {
      key: currentDate.toISOString(),
      date: currentDate,
      day: index + 1,
      isToday: currentDate.toDateString() === today.toDateString(),
      hasEntries: dateEntries[normalizedDate]?.length > 0,
      status: dateStatuses[normalizedDate]
    };
  });

  // Calculate end padding to ensure complete weeks
  const totalDays = paddingDays.length + calendarDays.length;
  const remainingDays = 7 - (totalDays % 7);
  const endPaddingDays = remainingDays === 7 ? [] : Array.from({ length: remainingDays }, (_, index) => ({
    key: `padding-end-${index}`,
    isPadding: true
  }));

  // Calculate if we need an extra week of padding
  const numberOfWeeks = Math.ceil((paddingDays.length + calendarDays.length + endPaddingDays.length) / 7);
  const shouldAddExtraWeek = numberOfWeeks < 6;

  // Add extra week if needed to maintain consistent height
  const extraWeekPadding = shouldAddExtraWeek ? Array.from({ length: 7 }, (_, index) => ({
    key: `padding-extra-${index}`,
    isPadding: true
  })) : [];

  return [...paddingDays, ...calendarDays, ...endPaddingDays, ...extraWeekPadding];
};

export const checkDailyTargetsAndLimits = (entries, collections) => {
  if (!entries || entries.length === 0) return { hasMetTarget: false, hasExceededLimit: false };
  
  let hasMetTarget = false;
  let hasExceededLimit = false;

  const entriesByCollection = entries.reduce((acc, entry) => {
    if (!acc[entry.collectionName]) {
      acc[entry.collectionName] = [];
    }
    acc[entry.collectionName].push(entry);
    return acc;
  }, {});

  collections.forEach(collection => {
    if (!collection.customFields) return;

    const collectionEntries = entriesByCollection[collection.name] || [];
    
    collection.customFields.forEach(field => {
      if (!field.target?.timeFrame === 'day' && !field.limit?.timeFrame === 'day') return;

      let fieldTotal = 0;

      switch (field.type) {
        case 'boolean':
          fieldTotal = collectionEntries.filter(entry => entry[field.name] === true).length;
          if (field.target && field.target.value && fieldTotal >= field.target.value) {
            hasMetTarget = true;
          }
          break;

        case 'number':
          fieldTotal = collectionEntries.reduce((sum, entry) => {
            return sum + (parseFloat(entry[field.name]) || 0);
          }, 0);
          if (field.target && field.target.value && fieldTotal >= field.target.value) {
            hasMetTarget = true;
          }
          if (field.limit && field.limit.value && fieldTotal > field.limit.value) {
            hasExceededLimit = true;
          }
          break;

        case 'duration':
          fieldTotal = collectionEntries.reduce((sum, entry) => {
            const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
            const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
            return sum + convertDurationToMinutes(hours, minutes);
          }, 0);
          
          if (field.target) {
            const targetMinutes = convertDurationToMinutes(
              field.target.hours || 0,
              field.target.minutes || 0
            );
            if (fieldTotal >= targetMinutes) {
              hasMetTarget = true;
            }
          }
          
          if (field.limit) {
            const limitMinutes = convertDurationToMinutes(
              field.limit.hours || 0,
              field.limit.minutes || 0
            );
            if (fieldTotal > limitMinutes) {
              hasExceededLimit = true;
            }
          }
          break;
      }
    });
  });

  return { hasMetTarget, hasExceededLimit };
};