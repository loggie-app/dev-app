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

export const calculateTimeframeData = (entries, field, timeframe, startDate) => {
  let data = [];
  let cumulativeData = [];
  let runningTotal = 0;
  
  const getDateValue = (date, field, entries) => {
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });

    return dayEntries.reduce((sum, entry) => {
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

  if (timeframe === 'weekly') {
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const value = getDateValue(currentDate, field, entries);
      
      data.push(value);
      runningTotal += value;
      cumulativeData.push(runningTotal);
    }
  } else {
    // Monthly view - group by weeks
    for (let i = 0; i < 4; i++) {
      let weekTotal = 0;
      for (let j = 0; j < 7; j++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i * 7) + j);
        weekTotal += getDateValue(currentDate, field, entries);
      }
      data.push(weekTotal);
      runningTotal += weekTotal;
      cumulativeData.push(runningTotal);
    }
  }

  return {
    data,
    cumulativeData
  };
};

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};