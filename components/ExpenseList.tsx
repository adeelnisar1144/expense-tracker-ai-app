
import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import { EXPENSE_CATEGORIES } from '../constants';
import { Trash2, Utensils, Car, Film, Zap, HeartPulse, ShoppingCart, Package } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    Food: <Utensils size={20} />,
    Transportation: <Car size={20} />,
    Entertainment: <Film size={20} />,
    Utilities: <Zap size={20} />,
    Health: <HeartPulse size={20} />,
    Shopping: <ShoppingCart size={20} />,
    Other: <Package size={20} />,
  };
  return <div className="p-2 bg-blue-100 rounded-full text-brand-primary">{icons[category] || <Package size={20} />}</div>;
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const { formatCurrency } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
        const searchMatch = expense.notes.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, filterCategory]);

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search by notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}>
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {filteredAndSortedExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {expenses.length === 0 ? 'No expenses logged yet.' : 'No transactions match your search.'}
          </p>
        ) : (
          filteredAndSortedExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <CategoryIcon category={expense.category} />
                <div>
                  <p className="font-semibold text-gray-900">{expense.category}</p>
                  <p className="text-sm text-gray-500">{expense.notes || new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-brand-accent">- {formatCurrency(expense.amount)}</p>
                <button onClick={() => onDelete(expense.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ExpenseList;
