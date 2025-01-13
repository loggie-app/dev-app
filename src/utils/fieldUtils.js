import { DEFAULT_FIELD } from '../constants/fieldTypes';

export const validateFieldNames = (fields) => {
  const fieldNames = fields.map(f => f.name.toLowerCase());
  const uniqueNames = new Set(fieldNames);
  return uniqueNames.size === fieldNames.length;
};

export const validateFields = (fields) => {
  // Check for empty fields
  const hasEmptyFields = fields.some(field => !field.name || !field.type);
  if (hasEmptyFields) {
    return { isValid: false, error: 'Please fill in all field names and types' };
  }

  // Check for duplicate names
  if (!validateFieldNames(fields)) {
    return { isValid: false, error: 'Field names must be unique' };
  }

  return { isValid: true, error: null };
};

export const createNewField = () => ({
  ...DEFAULT_FIELD,
  id: Date.now().toString(),
});