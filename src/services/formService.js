import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCollectionEntriesKey } from './collectionService';

export const initializeFormData = (collection) => {
  const initialData = {
    id: '',
    date: new Date().toISOString(),
  };

  if (collection.customFields) {
    collection.customFields.forEach((field) => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'number') {
        initialData[field.name] = '';
      } else if (field.type === 'duration') {
        initialData[`${field.name}_hours`] = '';
        initialData[`${field.name}_minutes`] = '';
      } else {
        initialData[field.name] = '';
      }
    });
  }

  return initialData;
};

export const loadExistingEntries = async (collectionId) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    const existingEntriesJSON = await AsyncStorage.getItem(entriesKey);
    const entries = existingEntriesJSON ? JSON.parse(existingEntriesJSON) : [];
    return entries;
  } catch (error) {
    console.error('Error loading existing entries:', error);
    throw error;
  }
};

export const saveFormEntry = async (collectionId, formData, existingEntries) => {
  try {
    const entriesKey = getCollectionEntriesKey(collectionId);
    const newEntry = {
      ...formData,
      id: (existingEntries.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [...existingEntries, newEntry];
    await AsyncStorage.setItem(entriesKey, JSON.stringify(updatedEntries));
    
    return updatedEntries;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const updateFormField = (formData, fieldName, value) => {
  return {
    ...formData,
    [fieldName]: value
  };
};

export const getNextEntryId = (existingEntries) => {
  return (existingEntries.length + 1).toString();
};