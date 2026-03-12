
export type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Utilities' | 'Health' | 'Shopping' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  notes: string;
  date: string;
}

export interface Budget {
  id:string;
  category: Category;
  amount: number;
  period: 'monthly' | 'custom';
  startDate: string; // ISO String
  endDate: string; // ISO String
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: Category;
  notes: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // ISO String
}

export interface UserCredentials {
  password: string;
}

export interface User {
  name: string;
  email: string;
}

export interface Settings {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'RUB';
  language: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: string;
  data: {
    expenses: Expense[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    recurringTransactions: RecurringTransaction[];
    settings: Settings;
  };
}

export const SUPPORTED_CURRENCIES: Settings['currency'][] = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'RUB'];

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文 (Mandarin)' },
    { code: 'ar', name: 'العربية' },
];


export type ModalType = 'expense' | 'budget' | 'savings' | 'addFunds' | 'settings' | 'recurringTransaction' | 'chatbot' | 'achievements' | 'checkpoints';

export type DateRange = '7d' | '30d' | 'all';

export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
