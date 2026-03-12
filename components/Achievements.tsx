
import React, { useMemo } from 'react';
import { Expense, Budget, SavingsGoal } from '../types';
import Card from './common/Card';
import { Award, ShieldCheck, PiggyBank, TrendingUp, Lock, Star } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface AchievementsProps {
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  color: string;
}

const Achievements: React.FC<AchievementsProps> = ({ expenses, budgets, savingsGoals }) => {
  const { formatCurrency } = useSettings();

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
        id: 'budget-master',
        title: 'Budget Master',
        description: 'Create a budget envelope',
        icon: <ShieldCheck size={24} />,
        isUnlocked: budgets.length > 0,
        color: 'from-purple-400 to-purple-600',
      },
      {
        id: 'saver-starter',
        title: 'Saver Starter',
        description: `Reach ${formatCurrency(500)} in total savings`,
        icon: <PiggyBank size={24} />,
        isUnlocked: totalSaved >= 500,
        color: 'from-green-400 to-green-600',
      },
      {
        id: 'goal-crusher',
        title: 'Goal Crusher',
        description: 'Fully fund a savings goal',
        icon: <Star size={24} />,
        isUnlocked: completedGoals > 0,
        color: 'from-yellow-400 to-yellow-600',
      },
      {
        id: 'elite-saver',
        title: 'Elite Saver',
        description: `Reach ${formatCurrency(5000)} in total savings`,
        icon: <Award size={24} />,
        isUnlocked: totalSaved >= 5000,
        color: 'from-red-400 to-red-600',
      }
    ];
    return list;
  }, [expenses, budgets, savingsGoals, formatCurrency]);

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const progress = (unlockedCount / badges.length) * 100;

  return (
    <Card className="border-t-4 border-brand-primary">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Award className="text-brand-primary" /> Achievements
           </h3>
           <p className="text-sm text-gray-500">Track your financial milestones</p>
        </div>
        <div className="text-right">
             <span className="text-2xl font-bold text-brand-primary">{unlockedCount}/{badges.length}</span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
         <div className="bg-brand-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className={`
              relative group flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-300
              ${badge.isUnlocked ? 'bg-white shadow-md transform hover:-translate-y-1 hover:shadow-lg ring-1 ring-gray-100' : 'bg-gray-50 opacity-70'}
            `}
          >
            <div 
              className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm text-white
                ${badge.isUnlocked ? `bg-gradient-to-br ${badge.color}` : 'bg-gray-300'}
              `}
            >
              {badge.isUnlocked ? badge.icon : <Lock size={20} className="text-gray-500" />}
            </div>
            
            <h4 className={`font-bold text-sm mb-1 ${badge.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {badge.title}
            </h4>
            <p className="text-xs text-gray-500 leading-tight">
                {badge.description}
            </p>

            {/* Shine effect for unlocked badges */}
            {badge.isUnlocked && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </div>
            )}
            
            {/* Style specifically for the shine animation */}
            <style>{`
                @keyframes shine {
                    100% { left: 125%; }
                }
                .group-hover\\:animate-shine {
                    animation: shine 1s;
                }
            `}</style>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Achievements;
