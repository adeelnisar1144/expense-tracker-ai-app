import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Expense, Budget } from '../types';
import Card from './common/Card';
import { Lightbulb, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SpendingInsightProps {
  expenses: Expense[];
  budgets: Budget[];
}

const SpendingInsight: React.FC<SpendingInsightProps> = ({ expenses, budgets }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const fetchInsight = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);

    // Don't fetch if there are no expenses
    if (expenses.length === 0) {
        setInsight("Log some expenses to start getting personalized insights.");
        setIsLoading(false);
        return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentExpenses = expenses.filter(e => new Date(e.date) > thirtyDaysAgo);

      const contextData = JSON.stringify({
        expenses: recentExpenses.map(({ id, ...rest }) => rest),
        budgets: budgets.map(({ id, ...rest }) => rest),
      });
      
      const prompt = `System Instruction:
You are a sharp financial analyst for an app called BudgetFlow. Your task is to provide a single, concise, and actionable spending insight based on the user's financial data. The insight should be a single sentence, like a notification. Examples: "Your dining expenses are up 15% this month.", "You've saved a lot on transportation lately, great job!", "You are on track with your 'Utilities' budget.". The current date is ${new Date().toDateString()}. All monetary values are in ${settings.currency}. Do not be conversational, just provide the single sentence insight. If there's nothing interesting, you can say something encouraging like "Your spending is well-managed this month."

User's Financial Data:
${contextData}

Generate one insight.`;
      
      const responseText = await api.getAiInsight(prompt);
      setInsight(responseText);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching your insight.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [expenses, budgets, settings.currency]);

  useEffect(() => {
    // Fetch insight on initial mount
    fetchInsight();
  }, [fetchInsight]); // Dependency array is just fetchInsight which is memoized

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>Generating your personalized insight...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      );
    }
    if (insight) {
      return (
         <p className="text-gray-700 font-medium">{insight}</p>
      );
    }
    return null;
  }

  return (
    <Card className="h-full">
        <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full text-brand-yellow flex-shrink-0">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Spending Insight</h3>
                    </div>
                </div>
                <div className="text-sm mt-1 flex-grow flex items-center">{renderContent()}</div>
            </div>
            <button
                onClick={fetchInsight}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Refresh insight"
            >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
    </Card>
  );
};

export default SpendingInsight;