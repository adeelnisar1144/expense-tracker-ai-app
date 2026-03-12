import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Budget, Category } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Partial<Budget>) => void;
  budget: Budget | null;
  existingBudgetCategories: Category[];
}

const getISODateString = (date: Date) => date.toISOString().split('T')[0];

const BudgetForm: React.FC<BudgetFormProps> = ({ isOpen, onClose, onSave, budget, existingBudgetCategories }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [period, setPeriod] = useState<'monthly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState(getISODateString(new Date()));
  const [endDate, setEndDate] = useState(getISODateString(new Date()));
  const [error, setError] = useState('');

  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !existingBudgetCategories.includes(cat) || (budget && budget.category === cat)
  );

  useEffect(() => {
    if (isOpen) {
        if (budget) {
            setAmount(budget.amount.toString());
            setCategory(budget.category);
            setPeriod(budget.period);
            setStartDate(getISODateString(new Date(budget.startDate)));
            setEndDate(getISODateString(new Date(budget.endDate)));
        } else {
            setAmount('');
            setCategory(availableCategories.length > 0 ? availableCategories[0] : 'Food');
            setPeriod('monthly');
            setStartDate(getISODateString(new Date()));
        }
        setError('');
    }
  }, [budget, isOpen, existingBudgetCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
     if (period === 'custom' && new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (period === 'monthly') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        finalStartDate = getISODateString(firstDay);
        finalEndDate = getISODateString(lastDay);
    }


    setError('');
    onSave({
      id: budget?.id,
      amount: parseFloat(amount),
      category,
      period,
      startDate: finalStartDate,
      endDate: finalEndDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={budget ? 'Edit Budget' : 'Add New Budget'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="budget-category" className="block text-sm font-medium text-gray-600">Category</label>
          <Select 
            id="budget-category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={!!budget}
          >
            {budget && <option key={budget.category} value={budget.category}>{budget.category}</option>}
            {!budget && availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
           {!!budget && <p className="text-xs text-gray-400 mt-1">Category cannot be changed when editing.</p>}
           {!budget && availableCategories.length === 0 && <p className="text-xs text-yellow-400 mt-1">All categories already have a budget.</p>}
        </div>

        <div>
          <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-600">Amount</label>
          <Input
            id="budget-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-600">Period</label>
            <div className="mt-2 flex gap-4">
                <label className="flex items-center">
                    <input type="radio" value="monthly" checked={period === 'monthly'} onChange={() => setPeriod('monthly')} className="form-radio h-4 w-4 text-brand-primary transition duration-150 ease-in-out"/>
                    <span className="ml-2 text-gray-700">Monthly</span>
                </label>
                 <label className="flex items-center">
                    <input type="radio" value="custom" checked={period === 'custom'} onChange={() => setPeriod('custom')} className="form-radio h-4 w-4 text-brand-primary transition duration-150 ease-in-out"/>
                    <span className="ml-2 text-gray-700">Custom</span>
                </label>
            </div>
        </div>

        {period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-600">Start Date</label>
                    <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                 <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-600">End Date</label>
                    <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>
        )}
       
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!budget && availableCategories.length === 0}>
            {budget ? 'Save Changes' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetForm;