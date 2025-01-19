// src/utils/validationUtils.js

import { getTimeFrameDates } from './dateUtils';
import { convertDurationToMinutes } from './durationUtils';

export const checkDurationLimitsAndTargets = (field, hours, minutes, existingEntries) => {
  const totalMinutes = convertDurationToMinutes(hours, minutes);
  if (totalMinutes === 0) return null;

  if (field.trackingType === 'Set Limit' && field.limit) {
    const { timeFrame, hours: limitHours = 0, minutes: limitMinutes = 0 } = field.limit;
    const limitTotalMinutes = convertDurationToMinutes(limitHours, limitMinutes);
    const { startOfPeriod, endOfPeriod } = getTimeFrameDates(timeFrame);
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfPeriod && entryDate <= endOfPeriod;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      const entryMinutes = convertDurationToMinutes(
        entry[`${field.name}_hours`] || 0,
        entry[`${field.name}_minutes`] || 0
      );
      return sum + entryMinutes;
    }, totalMinutes);

    if (total > limitTotalMinutes) {
      const totalHours = Math.floor(total / 60);
      const totalMins = total % 60;
      const limitHrs = Math.floor(limitTotalMinutes / 60);
      const limitMins = limitTotalMinutes % 60;
      return {
        type: 'limit',
        message: `This entry would exceed your ${timeFrame}ly limit of ${limitHrs}h ${limitMins}m for ${field.name}. Current total would be ${totalHours}h ${totalMins}m.`
      };
    }
  }

  if (field.trackingType === 'Set Target' && field.target) {
    const { timeFrame, hours: targetHours = 0, minutes: targetMinutes = 0 } = field.target;
    const targetTotalMinutes = convertDurationToMinutes(targetHours, targetMinutes);
    const { startOfPeriod, endOfPeriod } = getTimeFrameDates(timeFrame);
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfPeriod && entryDate <= endOfPeriod;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      const entryMinutes = convertDurationToMinutes(
        entry[`${field.name}_hours`] || 0,
        entry[`${field.name}_minutes`] || 0
      );
      return sum + entryMinutes;
    }, totalMinutes);

    if (total >= targetTotalMinutes && relevantEntries.length === 0) {
      const totalHours = Math.floor(total / 60);
      const totalMins = total % 60;
      const targetHrs = Math.floor(targetTotalMinutes / 60);
      const targetMins = targetTotalMinutes % 60;
      return {
        type: 'target',
        message: `Congratulations! You've reached your ${timeFrame}ly target of ${targetHrs}h ${targetMins}m for ${field.name}!`
      };
    }
  }

  return null;
};

export const checkNumberFieldLimitsAndTargets = (field, value, existingEntries) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;

  if (field.trackingType === 'Set Limit' && field.limit) {
    const { timeFrame, value: limitValue } = field.limit;
    const { startOfPeriod, endOfPeriod } = getTimeFrameDates(timeFrame);
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfPeriod && entryDate <= endOfPeriod;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry[field.name]) || 0);
    }, numValue);

    if (total > limitValue) {
      return {
        type: 'limit',
        message: `This entry would exceed your ${timeFrame}ly limit of ${limitValue} for ${field.name}. Current total would be ${total}.`
      };
    }
  }

  if (field.trackingType === 'Set Target' && field.target) {
    const { timeFrame, value: targetValue } = field.target;
    const { startOfPeriod, endOfPeriod } = getTimeFrameDates(timeFrame);
    
    // Filter entries based on time frame
    const relevantEntries = existingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfPeriod && entryDate <= endOfPeriod;
    });

    // Calculate total including current value
    const total = relevantEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry[field.name]) || 0);
    }, numValue);

    if (total >= targetValue && relevantEntries.length === 0) {
      return {
        type: 'target',
        message: `Congratulations! You've reached your ${timeFrame}ly target of ${targetValue} for ${field.name}!`
      };
    }
  }

  return null;
};

export const validateFormData = (formData, collection, existingEntries) => {
  const errors = [];
  const warnings = [];
  
  collection.customFields?.forEach((field) => {
    if (field.required) {
      if (field.type === 'duration') {
        const hours = formData[`${field.name}_hours`];
        const minutes = formData[`${field.name}_minutes`];
        if (!hours && !minutes) {
          errors.push(`${field.name} is required`);
        }
      } else if (!formData[field.name] && formData[field.name] !== false) {
        errors.push(`${field.name} is required`);
      }
    }
    
    if (field.type === 'duration') {
      const hours = formData[`${field.name}_hours`];
      const minutes = formData[`${field.name}_minutes`];
      if ((hours && isNaN(hours)) || (minutes && isNaN(minutes))) {
        errors.push(`${field.name} must contain valid numbers`);
      } else if (hours || minutes) {
        const limitCheck = checkDurationLimitsAndTargets(field, hours, minutes, existingEntries);
        if (limitCheck) {
          if (limitCheck.type === 'limit') {
            warnings.push(limitCheck.message); // Changed from errors to warnings
          } else if (limitCheck.type === 'target') {
            warnings.push(limitCheck.message);
          }
        }
      }
    } else if (field.type === 'number' && formData[field.name]) {
      const limitCheck = checkNumberFieldLimitsAndTargets(field, formData[field.name], existingEntries);
      if (limitCheck) {
        if (limitCheck.type === 'limit') {
          warnings.push(limitCheck.message); // Changed from errors to warnings
        } else if (limitCheck.type === 'target') {
          warnings.push(limitCheck.message);
        }
      }
    }
  });

  return { errors, warnings };
};