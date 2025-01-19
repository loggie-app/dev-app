// src/utils/reportCalculations.js

export const calculatePeriodValue = (value, originalTimeFrame, targetTimeFrame) => {
  if (originalTimeFrame === targetTimeFrame) return value;

  // Converting monthly value to weekly
  if (originalTimeFrame === 'month' && targetTimeFrame === 'week') {
    const weeklyValue = (value * 12) / 52;
    return Math.ceil(weeklyValue); // Round up as per requirement
  }

  // Converting weekly value to monthly
  if (originalTimeFrame === 'week' && targetTimeFrame === 'month') {
    return value * 4.33; // Approximate weeks in a month
  }

  return value;
}; 

export const aggregateFieldEntries = (entries, field, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= dayStart && entryDate <= dayEnd;
  });

  switch (field.type) {
    case 'boolean':
      // Ensure exact count for boolean values
      return dayEntries.reduce((count, entry) => 
        entry[field.name] === true ? count + 1 : count, 0);

    case 'number':
      return dayEntries.reduce((sum, entry) => 
        sum + (parseFloat(entry[field.name]) || 0), 0);

    case 'duration':
      return dayEntries.reduce((sum, entry) => {
        const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
        const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
        return sum + (hours * 60 + minutes);
      }, 0);

    default:
      return 0;
  }
};