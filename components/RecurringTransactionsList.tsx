
import React from 'react';
import { RecurringTransaction } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { Plus, Edit2, Trash2, CalendarClock, DollarSign } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface RecurringTransactionsListProps {
  transactions: RecurringTransaction[];
  onAddTransaction: () => void;
  onEditTransaction: (transaction: RecurringTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onLogPayment: (id: string) => void;
}

const RecurringTransactionsList: React.FC<RecurringTransactionsListProps> = ({ transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, onLogPayment }) => {
  const { formatCurrency } = useSettings();
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Bills & Subscriptions</h3>
        <Button 
          variant="secondary" 
          onClick={onAddTransaction} 
          className="text-sm px-3 py-1 flex items-center gap-1"
        >
          <Plus size={16} /> Add Bill
        </Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sortedTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recurring bills set. Add one to get reminders.</p>
        ) : (
          sortedTransactions.map(t => (
            <div key={t.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-gray-900">{t.notes}</p>
                        <p className="text-sm text-gray-500">{t.category}</p>
                    </div>
                    <p className="font-bold text-gray-800">{formatCurrency(t.amount)}</p>
                </div>
                 <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2 text-sm text-brand-primary font-medium">
                        <CalendarClock size={16}/>
                        <span>Due: {new Date(t.nextDueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button onClick={() => onLogPayment(t.id)} className="text-xs px-2 py-1 flex items-center gap-1" aria-label={`Log payment for ${t.notes}`}>
                            <DollarSign size={14} /> Log Payment
                        </Button>
                        <button onClick={() => onEditTransaction(t)} className="text-gray-400 hover:text-gray-800 transition-colors" aria-label={`Edit ${t.notes}`}>
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${t.notes}`}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                 </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecurringTransactionsList;
