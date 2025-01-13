const calculateBooleanStats = (field, entries, now) => {
  if (!field.target) return null;

  const targetValue = field.target.value;
  const timeFrame = field.target.timeFrame;

  const filteredEntries = entries.filter(entry => {
    if (entry[field.name] !== true) return false;
    const entryDate = new Date(entry.date);

    if (timeFrame === 'day') {
      return entryDate.toDateString() === now.toDateString();
    } else if (timeFrame === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    } else if (timeFrame === 'month') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
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
  
  const total = entries.reduce((sum, entry) => {
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
  const targetHours = field.limit?.hours || field.target?.hours || 0;
  const targetMinutes = field.limit?.minutes || field.target?.minutes || 0;
  
  const total = entries.reduce((sum, entry) => {
    const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
    const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
    return sum + (hours * 60 + minutes);
  }, 0);

  const totalHours = Math.floor(total / 60);
  const totalMinutes = total % 60;
  const targetTotalMinutes = (targetHours * 60) + targetMinutes;

  return {
    fieldName: field.name,
    type: 'duration',
    trackingType,
    currentHours: totalHours,
    currentMinutes: totalMinutes,
    targetHours,
    targetMinutes,
    timeFrame,
    complete: trackingType === 'Set Target' ? total >= targetTotalMinutes : total <= targetTotalMinutes
  };
};

const getTimeFrameDates = (now, timeFrame) => {
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
    startOfPeriod.setHours(0, 0, 0, 0);
    endOfPeriod.setHours(23, 59, 59, 999);
  }

  return { startOfPeriod, endOfPeriod };
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