
import React, { useState, useMemo, useEffect } from 'react';
import { api } from './api';
import { Expense, Budget, SavingsGoal, Category, ModalType, User, DateRange, Alert, RecurringTransaction } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetList from './components/BudgetList';
import SavingsGoals from './components/SavingsGoals';
import Charts from './components/Charts';
import ExpenseForm from './components/ExpenseForm';
import BudgetForm from './components/BudgetForm';
import SavingsGoalForm from './components/SavingsGoalForm';
import AddFundsForm from './components/AddFundsForm';
import Auth from './components/auth/Auth';
import LoginTransition from './components/auth/LoginTransition';
import { PlusCircle, Loader2, MessageSquare, Camera } from 'lucide-react';
import { SettingsProvider } from './contexts/SettingsContext';
import SettingsModal from './components/SettingsModal';
import Alerts from './components/Alerts';
import RecurringTransactionsList from './components/RecurringTransactionsList';
import RecurringTransactionForm from './components/RecurringTransactionForm';
import ChatbotModal from './components/ChatbotModal';
import SpendingInsight from './components/SpendingInsight';
import ExpenseForecast from './components/ExpenseForecast';
import ChallengeCard from './components/ChallengeCard';
import FinancialTipsFeed from './components/FinancialTipsFeed';
import ReceiptScanner from './components/ReceiptScanner';
import AchievementsWidget from './components/AchievementsWidget';
import AchievementsModal from './components/AchievementsModal';
import OfflineBanner from './components/OfflineBanner';
import CheckpointsModal from './components/CheckpointsModal';
import { useNetworkStatus } from './hooks/useNetworkStatus';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (currentUser) {
        setIsLoading(true);
        api.getDashboardData(currentUser.email)
            .then(data => {
                setExpenses(data.expenses);
                setBudgets(data.budgets);
                setSavingsGoals(data.savingsGoals);
                setRecurringTransactions(data.recurringTransactions);
            })
            .catch(error => console.error("Failed to load user data", error))
            .finally(() => setIsLoading(false));
    } else {
        setExpenses([]);
        setBudgets([]);
        setSavingsGoals([]);
        setRecurringTransactions([]);
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    budgets.forEach(budget => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        const spentAmount = expenses
            .filter(e => e.category === budget.category && new Date(e.date) >= startDate && new Date(e.date) <= endDate)
            .reduce((sum, e) => sum + e.amount, 0);
        const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
        if (percentage >= 90) {
            newAlerts.push({
                id: `budget-${budget.id}`,
                type: percentage >= 100 ? 'error' : 'warning',
                message: `Spent ${percentage.toFixed(0)}% of your ${budget.category} budget.`
            });
        }
    });

    recurringTransactions.forEach(rt => {
        const dueDate = new Date(rt.nextDueDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (dueDate <= today) {
            newAlerts.push({
                id: `bill-${rt.id}`,
                type: 'info',
                message: `Bill Due: ${rt.notes}`
            });
        }
    });
    setAlerts(newAlerts);
  }, [expenses, budgets, recurringTransactions]);

  const filteredExpenses = useMemo(() => {
    if (dateRange === 'all') return expenses;
    const days = dateRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return expenses.filter(e => new Date(e.date) >= cutoff);
  }, [expenses, dateRange]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);
  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);
  const totalSaved = useMemo(() => savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0), [savingsGoals]);

  const openModal = (type: ModalType, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalType(null);
  };

  const handleAddExpense = async (data: Omit<Expense, 'id'>) => {
    if (!currentUser) return;
    const res = await api.addExpense(currentUser.email, data);
    setExpenses(prev => [...prev, res]);
    closeModal();
  };

  const handleAddFundsToGoal = async (goalId: string, amount: number) => {
    if (!currentUser) return;
    const res = await api.addFundsToGoal(currentUser.email, goalId, amount);
    setSavingsGoals(res);
    closeModal();
  };

  if (!currentUser) return <Auth onLogin={user => { setCurrentUser(user); setIsTransitioning(true); }} />;
  if (isTransitioning) return <LoginTransition user={currentUser} onTransitionEnd={() => setIsTransitioning(false)} />;
  if (isLoading) return <div className="min-h-screen bg-brand-dark flex justify-center items-center"><Loader2 className="h-12 w-12 animate-spin text-brand-primary" /></div>;

  return (
    <SettingsProvider user={currentUser}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Header user={currentUser} onLogout={() => setCurrentUser(null)} onOpenSettings={() => openModal('settings')} />
          {!isOnline && <OfflineBanner />}
          
          <main className="mt-8 space-y-8">
            <Alerts alerts={alerts} onDismiss={() => {}} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SpendingInsight expenses={expenses} budgets={budgets} />
              <ExpenseForecast expenses={expenses} />
              <ChallengeCard expenses={expenses} budgets={budgets} />
              <FinancialTipsFeed />
            </div>

            <Dashboard totalExpenses={totalExpenses} totalBudget={totalBudget} totalSaved={totalSaved} />
            
            <AchievementsWidget expenses={expenses} budgets={budgets} savingsGoals={savingsGoals} recurringTransactions={recurringTransactions} onOpen={() => openModal('achievements')} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Charts expenses={expenses} dateRange={dateRange} setDateRange={setDateRange} />
              </div>
              <BudgetList budgets={budgets} expenses={expenses} onAddBudget={() => openModal('budget')} onEditBudget={b => openModal('budget', b)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ExpenseList expenses={expenses} onDelete={id => api.deleteExpense(currentUser.email, id).then(() => setExpenses(prev => prev.filter(e => e.id !== id)))} />
              <div className="space-y-8">
                <SavingsGoals goals={savingsGoals} onAddGoal={() => openModal('savings')} onEditGoal={g => openModal('savings', g)} onAddFunds={g => openModal('addFunds', g)} />
                <RecurringTransactionsList transactions={recurringTransactions} onAddTransaction={() => openModal('recurringTransaction')} onEditTransaction={t => openModal('recurringTransaction', t)} onDeleteTransaction={id => api.deleteRecurringTransaction(currentUser.email, id).then(setRecurringTransactions)} onLogPayment={id => api.logRecurringTransactionPayment(currentUser.email, id).then(res => { setExpenses(res.expenses); setRecurringTransactions(res.recurringTransactions); })} />
              </div>
            </div>
          </main>

          <div className="fixed bottom-8 right-8 flex flex-col gap-3">
              <button onClick={() => isOnline && openModal('chatbot')} className={`p-4 rounded-full shadow-lg ${isOnline ? 'bg-brand-secondary text-white' : 'bg-gray-300 text-gray-400'}`}><MessageSquare /></button>
              <button onClick={() => isOnline && setIsCameraOpen(true)} className={`p-4 rounded-full shadow-lg ${isOnline ? 'bg-brand-secondary text-white' : 'bg-gray-300 text-gray-400'}`}><Camera /></button>
              <button onClick={() => openModal('expense')} className="bg-brand-primary text-white p-5 rounded-full shadow-xl hover:scale-110 transition-transform"><PlusCircle size={28} /></button>
          </div>

          {isCameraOpen && <ReceiptScanner onClose={() => setIsCameraOpen(false)} onScanSuccess={handleAddExpense} />}
          {modalType === 'expense' && <ExpenseForm isOpen={isModalOpen} onClose={closeModal} onAddExpense={handleAddExpense} expense={editingItem} />}
          {modalType === 'budget' && <BudgetForm isOpen={isModalOpen} onClose={closeModal} onSave={data => api.saveBudget(currentUser.email, data).then(res => { setBudgets(res); closeModal(); })} budget={editingItem} existingBudgetCategories={budgets.map(b => b.category)} />}
          {modalType === 'savings' && <SavingsGoalForm isOpen={isModalOpen} onClose={closeModal} onSave={data => api.saveSavingsGoal(currentUser.email, data).then(res => { setSavingsGoals(res); closeModal(); })} goal={editingItem} />}
          {modalType === 'addFunds' && <AddFundsForm isOpen={isModalOpen} onClose={closeModal} onAddFunds={handleAddFundsToGoal} goal={editingItem} />}
          {modalType === 'settings' && <SettingsModal isOpen={isModalOpen} onClose={closeModal} user={currentUser} onOpenCheckpoints={() => openModal('checkpoints')} />}
          {modalType === 'chatbot' && <ChatbotModal isOpen={isModalOpen} onClose={closeModal} data={{ expenses, budgets, savingsGoals, recurringTransactions }} />}
          {modalType === 'achievements' && <AchievementsModal isOpen={isModalOpen} onClose={closeModal} data={{ expenses, budgets, savingsGoals, recurringTransactions }} />}
          {modalType === 'checkpoints' && <CheckpointsModal isOpen={isModalOpen} onClose={closeModal} user={currentUser} />}
          {modalType === 'recurringTransaction' && <RecurringTransactionForm isOpen={isModalOpen} onClose={closeModal} onSave={data => api.saveRecurringTransaction(currentUser.email, data).then(setRecurringTransactions).then(closeModal)} transaction={editingItem} />}
        </div>
      </div>
    </SettingsProvider>
  );
};

export default App;
