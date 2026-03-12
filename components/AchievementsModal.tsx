import React from 'react';
import Modal from './Modal';
import { useAchievements } from '../hooks/useAchievements';
import { Expense, Budget, SavingsGoal, RecurringTransaction } from '../types';
import { Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    expenses: Expense[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    recurringTransactions: RecurringTransaction[];
  };
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, data }) => {
  const { badges, unlockedCount, totalBadges, progress } = useAchievements(data);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Achievements Gallery">
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Level Progress</h4>
            <span className="text-2xl font-bold text-brand-primary">{unlockedCount} <span className="text-gray-400 text-lg">/ {totalBadges}</span></span>
        </div>
         <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
                className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                style={{ width: `${progress}%` }}
            ></div>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-xl text-center border-2 transition-all duration-300
              ${badge.isUnlocked 
                ? 'bg-white border-transparent shadow-md hover:shadow-lg' 
                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
              }
            `}
          >
            <div 
              className={`
                w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm text-white
                ${badge.isUnlocked ? `bg-gradient-to-br ${badge.color}` : 'bg-gray-300'}
              `}
            >
              {badge.isUnlocked ? badge.icon : <Lock size={24} className="text-gray-500" />}
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
                    <div className="absolute top-0 -inset-full h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 hover:animate-shine" />
                </div>
            )}
             <style>{`
                @keyframes shine {
                    100% { left: 125%; }
                }
                .hover\\:animate-shine {
                    animation: shine 1s;
                }
            `}</style>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AchievementsModal;
