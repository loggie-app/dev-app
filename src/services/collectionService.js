// src/services/collectionService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeekDates, normalizeDate } from '../utils/dateUtils';
import calculateTargetStats from '../utils/statsCalculator';

const COLLECTIONS_KEY = 'collections';

export const getCollectionEntriesKey = (collectionId) => `entries_${collectionId}`;

export const loadCollections = async () => {
  try {
    const storedCollectionsJSON = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const storedCollections = storedCollectionsJSON ? JSON.parse(storedCollectionsJSON) : [];

    const updatedCollections = await Promise.all(
      storedCollections.map(async (collection) => {
        const entriesKey = getCollectionEntriesKey(collection.id);
        const entriesJSON = await AsyncStorage.getItem(entriesKey);
        const entries = entriesJSON ? JSON.parse(entriesJSON) : [];

        // Get current week dates (Monday to Sunday)
        const currentWeekDates = getCurrentWeekDates();
        const startOfWeek = new Date(currentWeekDates[0]);
        const endOfWeek = new Date(currentWeekDates[6]);
        endOfWeek.setHours(23, 59, 59, 999); // Set to end of Sunday
        
        // Filter entries for current week, including Sunday
        const currentWeekEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        });

        // Calculate active days for current week
        const activeDays = currentWeekEntries.reduce((days, entry) => {
          const entryDate = new Date(entry.date);
          const dayOfWeek = entryDate.getDay();
          // Convert 0 (Sunday) to 7, keep other days as is (1-6 for Mon-Sat)
          const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          if (!days.includes(adjustedDay)) {
            days.push(adjustedDay);
          }
          return days.sort((a, b) => a - b);
        }, []);

        // Calculate target stats using all entries
        const targetStats = calculateTargetStats(collection, entries);

        // Find last updated date from all entries
        const lastUpdated = entries.length > 0 
          ? entries.reduce((latest, entry) => {
              const entryDate = new Date(entry.date);
              return entryDate > new Date(latest) ? entry.date : latest;
            }, entries[0].date) 
          : null;

        return {
          ...collection,
          entriesCount: currentWeekEntries.length,
          lastUpdated,
          activeDays,
          targetStats,
        };
      })
    );

    return updatedCollections;
  } catch (error) {
    console.error('Failed to load collections:', error);
    throw error;
  }
};

export const saveCollection = async (collectionData, isNew = false) => {
  try {
    let collectionToSave = collectionData;

    if (isNew) {
      collectionToSave = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...collectionData,
        name: collectionData.name.trim(),
        description: collectionData.description?.trim() || '',
        customFields: collectionData.type === 'custom' ? collectionData.customFields : null,
      };
    }

    const existingCollectionsJSON = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const existingCollections = existingCollectionsJSON ? JSON.parse(existingCollectionsJSON) : [];
    
    const updatedCollections = [...existingCollections, collectionToSave];
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
    
    return isNew ? collectionToSave : updatedCollections;
  } catch (error) {
    console.error('Failed to save collection:', error);
    throw new Error(isNew ? 'Failed to create collection. Please try again.' : 'Failed to save collection.');
  }
};

export const deleteCollection = async (collectionId) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    await AsyncStorage.removeItem(entriesKey);

    const storedCollectionsJSON = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const storedCollections = storedCollectionsJSON ? JSON.parse(storedCollectionsJSON) : [];
    const updatedCollections = storedCollections.filter((col) => col.id !== collectionId);
    
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
    return updatedCollections;
  } catch (error) {
    console.error('Failed to delete collection:', error);
    throw error;
  }
};

export const saveEntry = async (collectionId, entry) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    const existingEntriesJSON = await AsyncStorage.getItem(entriesKey);
    const existingEntries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
    
    // Add a unique id if not present
    const newEntry = {
      ...entry,
      id: entry.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedEntries = [...existingEntries, newEntry];
    await AsyncStorage.setItem(entriesKey, JSON.stringify(updatedEntries));
    
    return updatedEntries;
  } catch (error) {
    console.error('Failed to save entry:', error);
    throw error;
  }
};

export const deleteEntry = async (collectionId, entryId) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    const existingEntriesJSON = await AsyncStorage.getItem(entriesKey);
    const existingEntries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
    
    const updatedEntries = existingEntries.filter((entry) => entry.id !== entryId);
    await AsyncStorage.setItem(entriesKey, JSON.stringify(updatedEntries));
    
    return updatedEntries;
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw error;
  }
};

export const loadCollectionEntries = async (collectionId) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    const entriesJSON = await AsyncStorage.getItem(entriesKey);
    const entries = entriesJSON ? JSON.parse(entriesJSON) : [];
    entries.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    return entries;
  } catch (error) {
    console.error('Error loading entries:', error);
    throw error;
  }
};

export const getCollectionStats = async (collection) => {
  const entries = await loadCollectionEntries(collection.id);
  
  // Get current week entries
  const currentWeekDates = getCurrentWeekDates();
  const startOfWeek = new Date(currentWeekDates[0]);
  const endOfWeek = new Date(currentWeekDates[6]);
  endOfWeek.setHours(23, 59, 59, 999); // Set to end of Sunday

  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek && entryDate <= endOfWeek;
  });

  return {
    entries,
    targetStats: calculateTargetStats(collection, entries),
    entriesCount: weekEntries.length,
    lastUpdated: entries.reduce((latest, entry) => {
      const entryDate = new Date(entry.date);
      return entryDate > new Date(latest) ? entry.date : latest;
    }, null)
  };
};

export const validateCollection = (name, type) => {
  if (!name.trim()) {
    throw new Error('Collection name is required');
  }
  if (!type) {
    throw new Error('Please select a collection type');
  }
  return true;
};