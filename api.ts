
import { Expense, Budget, SavingsGoal, User, Category, UserCredentials, Settings, RecurringTransaction, Checkpoint } from './types';
import { GoogleGenAI } from "@google/genai";

const API_LATENCY = 300;

const simulateApiCall = <T>(data: T, shouldFail: boolean = false): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("API request failed. Please try again."));
            } else {
                resolve(data);
            }
        }, API_LATENCY);
    });
};

const getUsers = (): Record<string, UserCredentials> => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, UserCredentials>) => {
    localStorage.setItem('users', JSON.stringify(users));
};

const getUserProfiles = (): Record<string, User> => {
    const profiles = localStorage.getItem('userProfiles');
    return profiles ? JSON.parse(profiles) : {};
}

const saveUserProfiles = (profiles: Record<string, User>) => {
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
}

const getData = <T>(key: string, userId: string, initialValue: T): T => {
    const storageKey = `${key}_${userId}`;
    const jsonValue = localStorage.getItem(storageKey);
    try {
        if (jsonValue !== null) {
            return JSON.parse(jsonValue);
        }
        return initialValue;
    } catch {
        return initialValue;
    }
};

const saveData = <T>(key: string, userId: string, data: T) => {
    const storageKey = `${key}_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
};

export const api = {
    // --- Auth ---
    async signup(email: string, name: string, password: string): Promise<User> {
        const users = getUsers();
        if (users[email]) throw new Error('An account with this email already exists.');
        users[email] = { password };
        saveUsers(users);
        const profiles = getUserProfiles();
        const user = { name, email };
        profiles[email] = user;
        saveUserProfiles(profiles);
        return simulateApiCall<User>(user);
    },

    async login(email: string, password: string): Promise<User> {
        const users = getUsers();
        if (users[email] && users[email].password === password) {
            const profiles = getUserProfiles();
            const user = profiles[email] || { name: email.split('@')[0], email };
            return simulateApiCall<User>(user);
        }
        throw new Error('Invalid email or password.');
    },

    async socialLogin(provider: string): Promise<{ user: User, isNew: boolean }> {
        const email = `user@${provider}.com`;
        const users = getUsers();
        const profiles = getUserProfiles();
        let isNew = false;
        if (!users[email]) {
            isNew = true;
            users[email] = { password: `social_login_${Date.now()}` };
            saveUsers(users);
        }
        if (!profiles[email]) {
            isNew = true;
            profiles[email] = { name: `${provider} User`, email };
            saveUserProfiles(profiles);
        }
        return simulateApiCall({ user: profiles[email], isNew });
    },

    async updateUserProfile(email: string, updates: Partial<User>): Promise<User> {
        const profiles = getUserProfiles();
        profiles[email] = { ...profiles[email], ...updates };
        saveUserProfiles(profiles);
        return simulateApiCall(profiles[email]);
    },

    // --- Data ---
    async getDashboardData(userId: string): Promise<{ expenses: Expense[], budgets: Budget[], savingsGoals: SavingsGoal[], recurringTransactions: RecurringTransaction[] }> {
        const expenses = getData<Expense[]>('expenses', userId, []);
        const budgets = getData<Budget[]>('budgets', userId, []);
        const savingsGoals = getData<SavingsGoal[]>('savingsGoals', userId, []);
        const recurringTransactions = getData<RecurringTransaction[]>('recurringTransactions', userId, []);
        return simulateApiCall({ expenses, budgets, savingsGoals, recurringTransactions });
    },

    async restoreBackup(userId: string, data: any): Promise<void> {
        if (data.expenses) saveData('expenses', userId, data.expenses);
        if (data.budgets) saveData('budgets', userId, data.budgets);
        if (data.savingsGoals) saveData('savingsGoals', userId, data.savingsGoals);
        if (data.recurringTransactions) saveData('recurringTransactions', userId, data.recurringTransactions);
        if (data.settings) saveData('settings', userId, data.settings);
        return simulateApiCall(undefined);
    },

    // --- Expenses ---
    async addExpense(userId: string, expenseData: Omit<Expense, 'id'>): Promise<Expense> {
        const expenses = getData<Expense[]>('expenses', userId, []);
        const newExpense = { ...expenseData, id: Date.now().toString() };
        saveData('expenses', userId, [...expenses, newExpense]);
        return simulateApiCall(newExpense);
    },

    async deleteExpense(userId: string, id: string): Promise<void> {
        const expenses = getData<Expense[]>('expenses', userId, []);
        saveData('expenses', userId, expenses.filter(e => e.id !== id));
        return simulateApiCall(undefined);
    },

    // --- Budgets ---
    async saveBudget(userId: string, budgetData: Partial<Budget>): Promise<Budget[]> {
        let budgets = getData<Budget[]>('budgets', userId, []);
        if (budgetData.id) {
            budgets = budgets.map(b => b.id === budgetData.id ? { ...b, ...budgetData } as Budget : b);
        } else {
            budgets.push({ ...budgetData, id: Date.now().toString() } as Budget);
        }
        saveData('budgets', userId, budgets);
        return simulateApiCall(budgets);
    },

    // --- Savings ---
    async saveSavingsGoal(userId: string, goalData: any): Promise<SavingsGoal[]> {
        let goals = getData<SavingsGoal[]>('savingsGoals', userId, []);
        if (goalData.id) {
            goals = goals.map(g => g.id === goalData.id ? { ...g, ...goalData } : g);
        } else {
            goals.push({ ...goalData, id: Date.now().toString(), currentAmount: 0 });
        }
        saveData('savingsGoals', userId, goals);
        return simulateApiCall(goals);
    },

    async addFundsToGoal(userId: string, id: string, amount: number): Promise<SavingsGoal[]> {
        let goals = getData<SavingsGoal[]>('savingsGoals', userId, []);
        goals = goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g);
        saveData('savingsGoals', userId, goals);
        return simulateApiCall(goals);
    },

    // --- Recurring ---
    async saveRecurringTransaction(userId: string, data: any): Promise<RecurringTransaction[]> {
        let trans = getData<RecurringTransaction[]>('recurringTransactions', userId, []);
        if (data.id) {
            trans = trans.map(t => t.id === data.id ? { ...t, ...data } : t);
        } else {
            trans.push({ ...data, id: Date.now().toString() });
        }
        saveData('recurringTransactions', userId, trans);
        return simulateApiCall(trans);
    },

    async deleteRecurringTransaction(userId: string, id: string): Promise<RecurringTransaction[]> {
        let trans = getData<RecurringTransaction[]>('recurringTransactions', userId, []);
        trans = trans.filter(t => t.id !== id);
        saveData('recurringTransactions', userId, trans);
        return simulateApiCall(trans);
    },

    async logRecurringTransactionPayment(userId: string, id: string): Promise<{ expenses: Expense[], recurringTransactions: RecurringTransaction[] }> {
        const trans = getData<RecurringTransaction[]>('recurringTransactions', userId, []);
        const t = trans.find(item => item.id === id);
        if (!t) throw new Error("Transaction not found");
        
        const expense = await this.addExpense(userId, {
            amount: t.amount,
            category: t.category,
            date: new Date().toISOString().split('T')[0],
            notes: `Auto-payment: ${t.notes}`
        });

        const nextDate = new Date(t.nextDueDate);
        if (t.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (t.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (t.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (t.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        const updatedTrans = trans.map(item => item.id === id ? { ...item, nextDueDate: nextDate.toISOString().split('T')[0] } : item);
        saveData('recurringTransactions', userId, updatedTrans);

        const expenses = getData<Expense[]>('expenses', userId, []);
        return simulateApiCall({ expenses, recurringTransactions: updatedTrans });
    },

    // --- Checkpoints ---
    async getCheckpoints(userId: string): Promise<Checkpoint[]> {
        return getData<Checkpoint[]>('checkpoints', userId, []);
    },

    async createCheckpoint(userId: string, name: string): Promise<Checkpoint[]> {
        const checkpoints = getData<Checkpoint[]>('checkpoints', userId, []);
        const data = await this.getDashboardData(userId);
        const settings = getData<Settings>('settings', userId, { currency: 'USD', language: 'en' });
        
        const newCheckpoint: Checkpoint = {
            id: Date.now().toString(),
            name,
            timestamp: new Date().toISOString(),
            data: { ...data, settings }
        };
        const updated = [newCheckpoint, ...checkpoints];
        saveData('checkpoints', userId, updated);
        return simulateApiCall(updated);
    },

    async deleteCheckpoint(userId: string, id: string): Promise<Checkpoint[]> {
        const checkpoints = getData<Checkpoint[]>('checkpoints', userId, []);
        const updated = checkpoints.filter(c => c.id !== id);
        saveData('checkpoints', userId, updated);
        return simulateApiCall(updated);
    },

    // --- AI ---
    async getAiInsight(prompt: string): Promise<string> {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            return response.text || "No insight available.";
        } catch (e) {
            console.error("AI Error:", e);
            throw e;
        }
    },

    async scanReceipt(base64Image: string): Promise<Omit<Expense, 'id'>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Extract the following from this receipt: total amount (as number), date (YYYY-MM-DD), and suggested category (Food, Transportation, Entertainment, Utilities, Health, Shopping, Other). Return ONLY JSON." }
                ]
            }
        });
        const text = response.text || "{}";
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return {
            amount: json.amount || 0,
            date: json.date || new Date().toISOString().split('T')[0],
            category: json.category || 'Other',
            notes: "Scanned Receipt"
        };
    }
};
