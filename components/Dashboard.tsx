import React from 'react';
import { DollarSign, PiggyBank, Scale } from 'lucide-react';
import Card from './common/Card';
import { useSettings } from '../contexts/SettingsContext';

interface DashboardProps {
  totalExpenses: number;
  totalBudget: number;
  totalSaved: number;
}

const Dashboard: React.FC<DashboardProps> = ({ totalExpenses, totalBudget, totalSaved }) => {
  const { formatCurrency } = useSettings();
  const remainingBudget = totalBudget - totalExpenses;
  const budgetStatusColor = remainingBudget >= 0 ? 'text-brand-primary' : 'text-brand-accent';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Total Expenses</h3>
            <DollarSign className="text-brand-accent" size={24} />
        </div>
        <p className="text-3xl font-bold mt-2 text-brand-accent">{formatCurrency(totalExpenses)}</p>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Remaining Budget</h3>
            <Scale className={budgetStatusColor} size={24} />
        </div>
        <p className={`text-3xl font-bold mt-2 ${budgetStatusColor}`}>{formatCurrency(remainingBudget)}</p>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Total Saved</h3>
            <PiggyBank className="text-brand-secondary" size={24} />
        </div>
        <p className="text-3xl font-bold mt-2 text-brand-secondary">{formatCurrency(totalSaved)}</p>
      </Card>
    </div>
  );
};

export default Dashboard;