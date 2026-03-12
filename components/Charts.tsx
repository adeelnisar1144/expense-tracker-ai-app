import React, { useMemo } from 'react';
import { Expense, Category, DateRange } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from './common/Card';
import { useSettings } from '../contexts/SettingsContext';

interface ChartsProps {
  expenses: Expense[];
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const COLORS = ['#4ade80', '#8b5cf6', '#f87171', '#facc15', '#22d3ee', '#3b82f6', '#ec4899'];

const Charts: React.FC<ChartsProps> = ({ expenses, dateRange, setDateRange }) => {
  const { formatCurrency } = useSettings();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-lg">
          <p className="label text-gray-900 font-semibold">{label}</p>
          <p className="intro text-gray-600">{`${payload[0].name} : ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    // Reset time part to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateRange === 'all') {
        return expenses;
    }
    const days = dateRange === '7d' ? 7 : 30;
    const startDate = new Date(new Date(today).setDate(today.getDate() - (days - 1)));
    
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate;
    });
  }, [expenses, dateRange]);


  const dataByCategory = useMemo(() => {
    const categoryMap = new Map<Category, number>();
    filteredExpenses.forEach(expense => {
      categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount);
    });
    return Array.from(categoryMap, ([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const dataByDay = useMemo(() => {
    const days = dateRange === '7d' ? 7 : 30;
    const dayMap = new Map<string, number>();
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap.set(formattedDate, 0);
    }
    
    filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const formattedDate = expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if(dayMap.has(formattedDate)){
            dayMap.set(formattedDate, (dayMap.get(formattedDate) || 0) + expense.amount);
        }
    });

    return Array.from(dayMap, ([name, Amount]) => ({ name, Amount })).reverse();
  }, [filteredExpenses, dateRange]);

  const renderDateFilter = () => (
    <div className="flex justify-start sm:justify-end gap-2 mb-6">
        {(['7d', '30d', 'all'] as DateRange[]).map(range => {
            const isActive = dateRange === range;
            return (
                <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        isActive ? 'bg-brand-primary text-white font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {range === '7d' && 'Last 7 Days'}
                    {range === '30d' && 'Last 30 Days'}
                    {range === 'all' && 'All Time'}
                </button>
            )
        })}
    </div>
  );

  return (
    <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Spending Analysis</h3>
            {renderDateFilter()}
        </div>
      
      {filteredExpenses.length === 0 ? (
          <div className="flex items-center justify-center h-80">
             <p className="text-gray-500">No expenses recorded in this period.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
            <div>
                 <h4 className="text-center text-gray-600 font-semibold mb-2">Daily Spending</h4>
                <ResponsiveContainer width="100%" aspect={1.6}>
                    <BarChart data={dataByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} />
                        <Bar dataKey="Amount" fill="#4ade80" name="Spent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="text-center text-gray-600 font-semibold mb-2">By Category</h4>
                <ResponsiveContainer width="100%" aspect={1.3}>
                    <PieChart>
                    <Pie
                        data={dataByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        innerRadius="50%"
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                    >
                        {dataByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '14px', color: '#374151' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </Card>
  );
};

export default Charts;