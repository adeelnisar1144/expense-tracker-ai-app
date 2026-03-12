import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { SavingsGoal } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface SavingsGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'> & { id?: string }) => void;
  goal: SavingsGoal | null;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ isOpen, onClose, onSave, goal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (goal) {
            setName(goal.name);
            setTargetAmount(goal.targetAmount.toString());
        } else {
            setName('');
            setTargetAmount('');
        }
        setError('');
    }
  }, [goal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        setError('Please enter a goal name.');
        return;
    }
    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    setError('');
    onSave({
      id: goal?.id,
      name,
      targetAmount: parseFloat(targetAmount),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Edit Savings Goal' : 'Add New Savings Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-name" className="block text-sm font-medium text-gray-600">Goal Name</label>
          <Input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emergency Fund"
            required
          />
        </div>
        <div>
          <label htmlFor="goal-target" className="block text-sm font-medium text-gray-600">Target Amount</label>
          <Input
            id="goal-target"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
       
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {goal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SavingsGoalForm;