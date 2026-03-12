import React from 'react';
import Card from './common/Card';
import { Award, ChevronRight } from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';
import { Expense, Budget, SavingsGoal, RecurringTransaction } from '../types';

interface AchievementsWidgetProps {
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[];
  onOpen: () => void;
}

const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({ 
  expenses, budgets, savingsGoals, recurringTransactions, onOpen 
}) => {
  const { badges, unlockedCount, totalBadges, progress } = useAchievements({
    expenses, budgets, savingsGoals, recurringTransactions
  });

  // Get the most recently unlocked badges (simulated by taking the last unlocked ones in the list for now)
  const unlockedBadges = badges.filter(b => b.isUnlocked).slice(0, 4);

  return (
    <Card className="border-t-4 border-brand-primary">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="text-brand-primary" /> Achievements
        </h3>
        <button 
            onClick={onOpen}
            className="text-sm text-brand-primary hover:text-brand-secondary flex items-center gap-1 font-semibold"
        >
            View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-gray-500 font-medium">Progress</span>
        <span className="font-bold text-brand-primary">{unlockedCount} / {totalBadges}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
         <div 
            className="bg-brand-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
         ></div>
      </div>
      
      {unlockedBadges.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {unlockedBadges.map(badge => (
                 <div key={badge.id} className="flex-shrink-0 flex flex-col items-center w-20 text-center" title={badge.title}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-sm bg-gradient-to-br ${badge.color}`}>
                        {React.cloneElement(badge.icon as React.ReactElement<any>, { size: 18 })}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 truncate w-full">{badge.title}</span>
                 </div>
            ))}
            {unlockedCount > 4 && (
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2 border border-gray-200">
                        <span className="text-xs font-bold">+{unlockedCount - 4}</span>
                    </div>
                </div>
            )}
        </div>
      ) : (
          <p className="text-sm text-gray-500 text-center py-2 italic">Start using the app to unlock badges!</p>
      )}
    </Card>
  );
};

export default AchievementsWidget;