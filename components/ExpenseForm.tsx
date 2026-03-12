
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Expense, Category } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  expense: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onAddExpense, expense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes);
    } else {
        setAmount('');
        setCategory('Food');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    }
  }, [expense, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    onAddExpense({
      amount: parseFloat(amount),
      category,
      date,
      notes,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Add New Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-600">Amount</label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-600">Category</label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-600">Date</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-600">Notes (Optional)</label>
          <Input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Lunch with colleagues"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{expense ? 'Save Changes' : 'Add Expense'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;