import { createNewField, validateFields } from '../utils/fieldUtils';

export const initializeFields = () => {
  return [createNewField()];
};

export const addField = (currentFields) => {
  return [...currentFields, createNewField()];
};

export const removeField = (fields, fieldId) => {
  if (fields.length <= 1) {
    throw new Error('You need at least one field');
  }
  return fields.filter(f => f.id !== fieldId);
};

export const updateField = (fields, fieldId, updates) => {
  return fields.map(field => 
    field.id === fieldId ? { ...field, ...updates } : field
  );
};

export const validateFieldsBeforeSubmit = (fields, navigation, collectionName) => {
  const validationResult = validateFields(fields);
  
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }
  
  navigation.navigate('AddCollection', {
    customFields: fields,
    collectionName
  });
};