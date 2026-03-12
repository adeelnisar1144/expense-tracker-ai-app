import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { SavingsGoal } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { useSettings } from '../contexts/SettingsContext';

interface AddFundsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunds: (goalId: string, amount: number) => void;
  goal: SavingsGoal;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ isOpen, onClose, onAddFunds, goal }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { formatCurrency } = useSettings();

  useEffect(() => {
    if (isOpen) {
        setAmount('');
        setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount to add.');
      return;
    }
    setError('');
    onAddFunds(goal.id, parseFloat(amount));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Funds to "${goal.name}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='text-sm text-gray-500'>
            <p>Current Progress: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
        </div>
        <div>
          <label htmlFor="add-funds-amount" className="block text-sm font-medium text-gray-600">Amount to Add</label>
          <Input
            id="add-funds-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
            autoFocus
          />
        </div>
       
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Add Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFundsForm;