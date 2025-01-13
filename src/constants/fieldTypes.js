export const DATA_TYPES = [
  { id: 'boolean', label: 'Yes/No', description: 'True/False value' },
  { id: 'number', label: 'Number', description: 'Numerical value' },
  { id: 'text', label: 'Text', description: 'Free text entry' },
  { id: 'duration', label: 'Duration', description: 'Time duration (hours & minutes)' }
];

export const TIME_FRAMES = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }
];

export const TRACKING_TYPES = [
  { id: 'none', label: 'None' },
  { id: 'limit', label: 'Set Limit' },
  { id: 'target', label: 'Set Target' }
];

export const DEFAULT_FIELD = {
  id: '1',
  name: '',
  type: '',
  required: true,
  target: null,
  limit: null,
  trackingType: null
};