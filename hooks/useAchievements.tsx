
import React, { useMemo } from 'react';
import { Expense, Budget, SavingsGoal, RecurringTransaction } from '../types';
import { Award, ShieldCheck, PiggyBank, TrendingUp, Lock, Star, Zap, Calendar, Target, Flame } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  color: string;
}

interface UseAchievementsProps {
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[];
}

export const useAchievements = ({ expenses, budgets, savingsGoals, recurringTransactions }: UseAchievementsProps) => {
  const { formatCurrency } = useSettings();

  const budgetStreak = useMemo(() => {
    // Calculate total monthly budget cap based on current "monthly" budgets.
    // This assumes current budget settings apply retroactively for streak calculation.
    const monthlyBudgetLimit = budgets
        .filter(b => b.period === 'monthly')
        .reduce((sum, b) => sum + b.amount, 0);

    // If no monthly budget is set, you can't have a streak.
    if (monthlyBudgetLimit === 0) return 0;

    let streak = 0;
    const now = new Date();
    
    // Check up to 12 months back including current
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        const monthExpenses = expenses
            .filter(e => {
                const ed = new Date(e.date);
                return ed >= start && ed <= end;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        // Streak continues if expenses are under limit
        if (monthExpenses <= monthlyBudgetLimit) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  }, [expenses, budgets]);

  const badges = useMemo(() => {
    const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    
    const list: Badge[] = [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Log your first expense',
        icon: <TrendingUp size={24} />,
        isUnlocked: expenses.length > 0,
        color: 'from-blue-400 to-blue-600',
      },
      {
        id: 'expense-tracker',
        title: 'Expense Tracker',
        description: 'Log 50 expenses',
        icon: <Zap size={24} />,
        isUnlocked: expenses.length >= 50,
        color: 'from-blue-500 to-indigo-600',
      },
      {
        id: 'budget-streak-1',
        title: 'On Track',
        description: 'Stay within budget this month',
        icon: <Flame size={24} />,
        isUnlocked: budgetStreak >= 1,
        color: 'from-orange-400 to-amber-500',
      },
       {
        id: 'budget-streak-3',
        title: 'Budget Streak',
        description: '3 months within budget',
        icon: <Flame size={24} />,
        isUnlocked: budgetStreak >= 3,
        color: 'from-orange-500 to-red-600',
      },
      {
        id: 'budget-beginner',
        title: 'Budget Beginner',
        description: 'Create your first budget',
        icon: <ShieldCheck size={24} />,
        isUnlocked: budgets.length > 0,
        color: 'from-purple-400 to-purple-600',
      },
      {
        id: 'budget-master',
        title: 'Budget Master',
        description: 'Create 5 budget envelopes',
        icon: <ShieldCheck size={24} />,
        isUnlocked: budgets.length >= 5,
        color: 'from-purple-600 to-fuchsia-600',
      },
      {
        id: 'saver-starter',
        title: 'Saver Starter',
        description: `Reach ${formatCurrency(100)} in savings`,
        icon: <PiggyBank size={24} />,
        isUnlocked: totalSaved >= 100,
        color: 'from-green-400 to-green-600',
      },
      {
        id: 'thrifty-saver',
        title: 'Thrifty Saver',
        description: `Reach ${formatCurrency(500)} in savings`,
        icon: <PiggyBank size={24} />,
        isUnlocked: totalSaved >= 500,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'super-saver',
        title: 'Super Saver',
        description: `Reach ${formatCurrency(1000)} in savings`,
        icon: <PiggyBank size={24} />,
        isUnlocked: totalSaved >= 1000,
        color: 'from-emerald-500 to-teal-600',
      },
       {
        id: 'wealth-builder',
        title: 'Wealth Builder',
        description: `Reach ${formatCurrency(5000)} in savings`,
        icon: <Award size={24} />,
        isUnlocked: totalSaved >= 5000,
        color: 'from-teal-500 to-cyan-600',
      },
      {
        id: 'goal-getter',
        title: 'Goal Getter',
        description: 'Fully fund 1 savings goal',
        icon: <Target size={24} />,
        isUnlocked: completedGoals >= 1,
        color: 'from-yellow-400 to-yellow-600',
      },
      {
        id: 'bill-watcher',
        title: 'Bill Watcher',
        description: 'Set up a recurring transaction',
        icon: <Calendar size={24} />,
        isUnlocked: recurringTransactions.length > 0,
        color: 'from-orange-400 to-red-500',
      }
    ];
    return list;
  }, [expenses, budgets, savingsGoals, recurringTransactions, formatCurrency, budgetStreak]);

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalBadges = badges.length;
  const progress = (unlockedCount / totalBadges) * 100;

  return { badges, unlockedCount, totalBadges, progress };
};
