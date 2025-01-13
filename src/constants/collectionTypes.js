export const COLLECTION_TYPES = [
  { id: 'custom', label: 'Custom Collection', description: 'Create your own tracking template' },
  { id: 'expenses', label: 'Expense Tracking', description: 'Track your spending and budgets' },
  { id: 'fitness', label: 'Fitness Journey', description: 'Monitor your workouts and progress' },
  { id: 'habits', label: 'Habit Building', description: 'Build and maintain good habits' },
  { id: 'savings', label: 'Savings Goals', description: 'Track your savings progress' }
];

export const DEFAULT_COLLECTION = {
  name: '',
  type: '',
  description: '',
  customFields: null,
};