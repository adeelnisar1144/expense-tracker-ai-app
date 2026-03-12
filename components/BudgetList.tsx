import React from 'react';
import { Budget, Expense } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { Plus, Edit2, Mail } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface BudgetListProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, expenses, onAddBudget, onEditBudget }) => {
  const { formatCurrency } = useSettings();

  const getSpentAmount = (category: string, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses
      .filter(expense => 
          expense.category === category &&
          new Date(expense.date) >= start &&
          new Date(expense.date) <= end
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getPeriodLabel = (budget: Budget) => {
    if (budget.period === 'monthly') {
        const month = new Date(budget.startDate).toLocaleString('default', { month: 'long' });
        return `For ${month}`;
    }
    const start = new Date(budget.startDate).toLocaleDateString();
    const end = new Date(budget.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Budget Envelopes</h3>
        <Button 
          variant="secondary" 
          onClick={onAddBudget} 
          className="text-sm px-3 py-1 flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const spentAmount = getSpentAmount(budget.category, budget.startDate, budget.endDate);
            const remainingAmount = budget.amount - spentAmount;
            const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
            const progressBarColor =
              percentage > 90 ? 'bg-brand-accent' : percentage > 70 ? 'bg-brand-yellow' : 'bg-brand-primary';

            return (
              <div key={budget.id}>
                 <div className="flex justify-between items-center text-sm mb-1">
                  <div className='flex items-center gap-2'>
                     <Mail size={16} className="text-gray-400" />
                     <span className="font-medium text-gray-900">{budget.category}</span>
                  </div>
                  <span className="text-xs text-gray-400">{getPeriodLabel(budget)}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${progressBarColor} h-2.5 rounded-full`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-1 text-sm">
                   <span className="font-semibold text-gray-700">
                      Remaining: {formatCurrency(remainingAmount)}
                    </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatCurrency(spentAmount, { maximumFractionDigits: 0 })} / {formatCurrency(budget.amount, { maximumFractionDigits: 0 })}
                    </span>
                    <button onClick={() => onEditBudget(budget)} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-4">No budgets set yet. Click 'Add' to create one.</p>
        )}
      </div>
    </Card>
  );
};

export default BudgetList;