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

        const targetStats = calculateTargetStats(collection, entries);
        const currentWeekDates = getCurrentWeekDates();
        
        const activeDays = entries.reduce((days, entry) => {
          const entryDate = normalizeDate(entry.date);

          currentWeekDates.forEach((weekDate, index) => {
            const normalizedWeekDate = normalizeDate(weekDate);

            if (
              entryDate.getTime() === normalizedWeekDate.getTime() &&
              !days.includes(index + 1)
            ) {
              days.push(index + 1);
            }
          });
          return days;
        }, []);

        const lastUpdated = entries.reduce((latest, entry) => {
          const entryDate = new Date(entry.date);
          return entryDate > new Date(latest) ? entry.date : latest;
        }, null);

        return {
          ...collection,
          entriesCount: entries.length,
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

export const saveCollection = async (collection) => {
  try {
    const existingCollectionsJSON = await AsyncStorage.getItem(COLLECTIONS_KEY);
    const existingCollections = existingCollectionsJSON ? JSON.parse(existingCollectionsJSON) : [];
    
    const updatedCollections = [...existingCollections, collection];
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
    
    return updatedCollections;
  } catch (error) {
    console.error('Failed to save collection:', error);
    throw error;
  }
};

export const deleteCollection = async (collectionId) => {
  try {
    // Delete collection entries
    const entriesKey = getCollectionEntriesKey(collectionId);
    await AsyncStorage.removeItem(entriesKey);

    // Delete collection from main list
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
    
    const updatedEntries = [...existingEntries, entry];
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
    // Sort entries by id to maintain order
    entries.sort((a, b) => a.id - b.id);
    return entries;
  } catch (error) {
    console.error('Error loading entries:', error);
    throw error;
  }
};

export const getCollectionStats = async (collection) => {
  const entries = await loadCollectionEntries(collection.id);
  return {
    entries,
    targetStats: calculateTargetStats(collection, entries),
    entriesCount: entries.length,
    lastUpdated: entries.reduce((latest, entry) => {
      const entryDate = new Date(entry.date);
      return entryDate > new Date(latest) ? entry.date : latest;
    }, null)
  };
};