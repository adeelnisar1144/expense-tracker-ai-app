import React from 'react';
import { SavingsGoal } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { Target, Plus, Edit2, PlusCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onAddFunds: (goal: SavingsGoal) => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onAddGoal, onEditGoal, onAddFunds }) => {
  const { formatCurrency } = useSettings();

  return (
    <Card>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Savings Goals</h3>
        <Button 
          variant="secondary" 
          onClick={onAddGoal} 
          className="text-sm px-3 py-1 flex items-center gap-1"
        >
          <Plus size={16} /> Add Goal
        </Button>
      </div>
      <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No savings goals set. Click 'Add Goal' to start.</p>
        ) : (
          goals.map(goal => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <Target className="text-brand-secondary" size={18}/>
                        <span className="font-semibold text-gray-900">{goal.name}</span>
                    </div>
                  <span className="text-sm font-medium text-brand-secondary">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-brand-secondary h-2.5 rounded-full"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <div className="text-left text-xs text-gray-500">
                        {formatCurrency(goal.currentAmount, { maximumFractionDigits: 0 })} / {formatCurrency(goal.targetAmount, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onAddFunds(goal)} className="text-gray-400 hover:text-brand-primary transition-colors" aria-label={`Add funds to ${goal.name}`}>
                            <PlusCircle size={18} />
                        </button>
                        <button onClick={() => onEditGoal(goal)} className="text-gray-400 hover:text-gray-800 transition-colors" aria-label={`Edit ${goal.name}`}>
                            <Edit2 size={16} />
                        </button>
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default SavingsGoals;