// src/utils/statsCalculator.js

import { getCurrentWeekDates } from './dateUtils';

const calculateBooleanStats = (field, entries, now) => {
  if (!field.target) return null;

  const targetValue = field.target.value;
  const timeFrame = field.target.timeFrame;

  const filteredEntries = entries.filter(entry => {
    if (entry[field.name] !== true) return false;
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    if (timeFrame === 'week') {
      const weekDates = getCurrentWeekDates();
      const startOfWeek = weekDates[0];
      const endOfWeek = new Date(weekDates[6]);
      endOfWeek.setHours(23, 59, 59, 999);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    } else if (timeFrame === 'month') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    } else if (timeFrame === 'day') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return entryDate >= today && entryDate <= endOfDay;
    }
    return false;
  });

  const count = filteredEntries.length;
  return {
    fieldName: field.name,
    type: 'boolean',
    targetValue,
    timeFrame,
    count,
    complete: count >= targetValue
  };
};

const calculateNumberStats = (field, entries, timeFrame, trackingType) => {
  const value = field.limit?.value || field.target?.value;
  
  // Filter entries based on timeframe
  const now = new Date();
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (timeFrame === 'week') {
      const weekDates = getCurrentWeekDates();
      const startOfWeek = weekDates[0];
      const endOfWeek = new Date(weekDates[6]);
      endOfWeek.setHours(23, 59, 59, 999);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    } else if (timeFrame === 'month') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    return false;
  });

  const total = filteredEntries.reduce((sum, entry) => {
    const entryValue = parseInt(entry[field.name], 10);
    if (!isNaN(entryValue)) {
      return sum + entryValue;
    }
    return sum;
  }, 0);

  return {
    fieldName: field.name,
    type: 'number',
    trackingType,
    value,
    timeFrame,
    total,
    complete: trackingType === 'Set Target' ? total >= value : total <= value
  };
};

const calculateDurationStats = (field, entries, timeFrame, trackingType) => {
  const targetHours = field.target?.hours || field.limit?.hours || 0;
  const targetMinutes = field.target?.minutes || field.limit?.minutes || 0;
  
  // Filter entries based on timeframe
  const now = new Date();
  const weekDates = getCurrentWeekDates();
  const startOfWeek = weekDates[0];
  const endOfWeek = new Date(weekDates[6]);
  endOfWeek.setHours(23, 59, 59, 999);

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (timeFrame === 'week') {
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    } else if (timeFrame === 'month') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    return false;
  });

  const totalMinutes = filteredEntries.reduce((sum, entry) => {
    const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
    const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
    return sum + (hours * 60 + minutes);
  }, 0);

  const currentHours = Math.floor(totalMinutes / 60);
  const currentMinutes = totalMinutes % 60;
  const targetTotalMinutes = (targetHours * 60) + targetMinutes;

  return {
    fieldName: field.name,
    type: 'duration',
    trackingType,
    currentHours,
    currentMinutes,
    targetHours,
    targetMinutes,
    timeFrame,
    complete: trackingType === 'Set Target' ? 
      totalMinutes >= targetTotalMinutes : 
      totalMinutes <= targetTotalMinutes
  };
};

export const calculateTargetStats = (collection, entries) => {
  if (!collection.customFields) return [];
  
  const stats = [];
  const now = new Date();

  collection.customFields.forEach(field => {
    // Handle boolean fields
    if (field.type === 'boolean' && field.target) {
      const booleanStats = calculateBooleanStats(field, entries, now);
      if (booleanStats) stats.push(booleanStats);
    }

    // Handle number and duration fields
    if ((field.type === 'number' || field.type === 'duration') && field.trackingType) {
      const timeFrame = field.limit?.timeFrame || field.target?.timeFrame;
      const trackingType = field.trackingType;

      if (timeFrame) {
        if (field.type === 'number') {
          stats.push(calculateNumberStats(field, entries, timeFrame, trackingType));
        } else if (field.type === 'duration') {
          stats.push(calculateDurationStats(field, entries, timeFrame, trackingType));
        }
      }
    }
  });

  return stats;
};

export default calculateTargetStats;