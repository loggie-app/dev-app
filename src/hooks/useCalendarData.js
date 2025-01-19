import { useState, useEffect } from 'react';
import * as collectionService from '../services/collectionService';
import { normalizeDate } from '../utils/dateUtils';
import { checkDailyTargetsAndLimits } from '../utils/calendarUtils';

export const useCalendarData = () => {
  const [collections, setCollections] = useState([]);
  const [dateEntries, setDateEntries] = useState({});
  const [dateStatuses, setDateStatuses] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEntries, setSelectedDateEntries] = useState([]);

  useEffect(() => {
    const loadCollectionsData = async () => {
      try {
        const loadedCollections = await collectionService.loadCollections();
        setCollections(loadedCollections);
        
        const entriesByDate = {};
        await Promise.all(
          loadedCollections.map(async (collection) => {
            const entries = await collectionService.loadCollectionEntries(collection.id);
            entries.forEach(entry => {
              const normalizedDate = normalizeDate(new Date(entry.date)).getTime();
              if (!entriesByDate[normalizedDate]) {
                entriesByDate[normalizedDate] = [];
              }
              entriesByDate[normalizedDate].push({
                ...entry,
                collectionName: collection.name
              });
            });
          })
        );

        setDateEntries(entriesByDate);

        // Calculate statuses for each date
        const statuses = {};
        Object.entries(entriesByDate).forEach(([dateTime, entries]) => {
          const status = checkDailyTargetsAndLimits(entries, loadedCollections);
          if (status.hasMetTarget || status.hasExceededLimit) {
            statuses[dateTime] = status;
          }
        });
        setDateStatuses(statuses);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      }
    };

    loadCollectionsData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const normalizedDate = normalizeDate(selectedDate).getTime();
      setSelectedDateEntries(dateEntries[normalizedDate] || []);
    }
  }, [selectedDate, dateEntries]);

  return {
    collections,
    dateEntries,
    dateStatuses,
    selectedDate,
    selectedDateEntries,
    setSelectedDate
  };
};