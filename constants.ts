
import { Category, Budget, SavingsGoal } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Health',
  'Shopping',
  'Other',
];

// Fix: Added missing properties to INITIAL_BUDGETS to match the Budget type.
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

export const INITIAL_BUDGETS: Budget[] = [
  { id: '1', category: 'Food', amount: 500, period: 'monthly', startDate: firstDayOfMonth, endDate: lastDayOfMonth },
  { id: '2', category: 'Transportation', amount: 150, period: 'monthly', startDate: firstDayOfMonth, endDate: lastDayOfMonth },
  { id: '3', category: 'Entertainment', amount: 200, period: 'monthly', startDate: firstDayOfMonth, endDate: lastDayOfMonth },
  { id: '4', category: 'Shopping', amount: 300, period: 'monthly', startDate: firstDayOfMonth, endDate: lastDayOfMonth },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
    { id: '1', name: 'Vacation Fund', targetAmount: 5000, currentAmount: 1250 },
    { id: '2', name: 'New Laptop', targetAmount: 1500, currentAmount: 900 },
];