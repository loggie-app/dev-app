// src/utils/chartUtils.js

export const findBreakpoint = (data, threshold) => {
  let runningTotal = 0;
  for (let i = 0; i < data.length; i++) {
    const prevTotal = runningTotal;
    runningTotal += data[i];
    
    if (runningTotal >= threshold) {
      // Calculate exact point where threshold was crossed
      const excess = runningTotal - threshold;
      const actualBreakValue = data[i] - excess;
      
      return {
        index: i,
        value: threshold,
        exactValue: actualBreakValue,
        total: runningTotal
      };
    }
  }
  return null;
};

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // If Sunday (0), go back 6 days to get to previous Monday
  // For other days, go back (day - 1) days to get to Monday
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const aggregateValues = (entries, field, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return entries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dayStart && entryDate <= dayEnd;
    })
    .reduce((sum, entry) => {
      if (field.type === 'boolean') {
        return sum + (entry[field.name] === true ? 1 : 0);
      } else if (field.type === 'number') {
        return sum + (parseFloat(entry[field.name]) || 0);
      } else if (field.type === 'duration') {
        const hours = parseInt(entry[`${field.name}_hours`], 10) || 0;
        const minutes = parseInt(entry[`${field.name}_minutes`], 10) || 0;
        return sum + (hours * 60 + minutes);
      }
      return sum;
    }, 0);
};