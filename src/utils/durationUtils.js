export const convertDurationToMinutes = (hours, minutes) => {
  return (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
};

export const minutesToDuration = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

export const formatDuration = (hours, minutes) => {
  const formattedHours = parseInt(hours, 10) || 0;
  const formattedMinutes = parseInt(minutes, 10) || 0;
  return `${formattedHours}h ${formattedMinutes}m`;
};

export const validateDurationInput = (value, isMinutes = false) => {
  const numValue = parseInt(value, 10);
  if (value === '') return true;
  if (isNaN(numValue)) return false;
  if (isMinutes && (numValue < 0 || numValue >= 60)) return false;
  if (!isMinutes && numValue < 0) return false;
  return true;
};

export const getDurationTotal = (entries, fieldName) => {
  return entries.reduce((sum, entry) => {
    const hours = parseInt(entry[`${fieldName}_hours`], 10) || 0;
    const minutes = parseInt(entry[`${fieldName}_minutes`], 10) || 0;
    return sum + convertDurationToMinutes(hours, minutes);
  }, 0);
};