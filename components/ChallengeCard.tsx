import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Expense, Budget } from '../types';
import Card from './common/Card';
import { Trophy, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface ChallengeCardProps {
  expenses: Expense[];
  budgets: Budget[];
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ expenses, budgets }) => {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setChallenge(null);

    if (expenses.length < 5) {
        setChallenge("Log more expenses to get personalized challenges.");
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
You are a motivational financial coach for an app called BudgetFlow. Your task is to analyze the user's recent spending and suggest a single, specific, and achievable financial challenge for them to complete this month. The challenge should be a single sentence. Examples: "Challenge: Spend less than ${settings.currency}150 on 'Shopping' this month.", "Try packing your lunch 3 times this week to save on food costs.". The current date is ${new Date().toDateString()}. All monetary values are in ${settings.currency}. Do not be conversational, just provide the single sentence for the challenge.

User's Financial Data:
${contextData}

Generate one financial challenge.`;
      
      const responseText = await api.getAiInsight(prompt);
      setChallenge(responseText);

    } catch (err) {
       setError(err instanceof Error ? err.message : "Couldn't generate a challenge right now.");
    } finally {
      setIsLoading(false);
    }
  }, [expenses, budgets, settings.currency]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>Crafting your next challenge...</span>
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
    if (challenge) {
      return (
         <p className="text-gray-700 font-medium">{challenge}</p>
      );
    }
    return null;
  }

  return (
    <Card className="h-full">
        <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-brand-green flex-shrink-0">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">This Month's Challenge</h3>
                    </div>
                </div>
                <div className="text-sm mt-1 flex-grow flex items-center">{renderContent()}</div>
            </div>
            <button
                onClick={fetchChallenge}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Get new challenge"
            >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
    </Card>
  );
};

export default ChallengeCard;