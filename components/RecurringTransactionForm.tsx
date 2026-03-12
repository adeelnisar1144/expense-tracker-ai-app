
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { RecurringTransaction, Category } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';

interface RecurringTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<RecurringTransaction>) => void;
  transaction: RecurringTransaction | null;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ isOpen, onClose, onSave, transaction }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Utilities');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setNotes(transaction.notes);
      setFrequency(transaction.frequency);
      setNextDueDate(new Date(transaction.nextDueDate).toISOString().split('T')[0]);
    } else {
      setAmount('');
      setCategory('Utilities');
      setNotes('');
      setFrequency('monthly');
      setNextDueDate(new Date().toISOString().split('T')[0]);
    }
     setError('');
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
     if (!notes.trim()) {
      setError('Please enter a description for the transaction.');
      return;
    }
    setError('');
    onSave({
      id: transaction?.id,
      amount: parseFloat(amount),
      category,
      notes,
      frequency,
      nextDueDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Bill' : 'Add New Bill'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rt-notes" className="block text-sm font-medium text-gray-600">Description</label>
          <Input id="rt-notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Netflix Subscription" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="rt-amount" className="block text-sm font-medium text-gray-600">Amount</label>
            <Input id="rt-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" required />
            </div>
            <div>
            <label htmlFor="rt-category" className="block text-sm font-medium text-gray-600">Category</label>
            <Select id="rt-category" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {EXPENSE_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </Select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="rt-frequency" className="block text-sm font-medium text-gray-600">Frequency</label>
            <Select id="rt-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </Select>
            </div>
            <div>
            <label htmlFor="rt-next-due-date" className="block text-sm font-medium text-gray-600">Next Due Date</label>
            <Input id="rt-next-due-date" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} required />
            </div>
        </div>
        
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{transaction ? 'Save Changes' : 'Add Bill'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecurringTransactionForm;
