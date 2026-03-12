import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import Card from './common/Card';
import { Sparkles, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

const FinancialTipsFeed: React.FC = () => {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTip = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTip(null);

    try {
      const prompt = `System Instruction:
You are a financial wellness expert. Your task is to provide a single, short, and helpful financial tip. The tip should be general advice for budgeting or saving money, suitable for a wide audience. Keep it concise and actionable. Examples: "Automate a small transfer to your savings account each payday.", "Review your subscriptions monthly to cut unnecessary costs.", "Use a 24-hour rule for non-essential purchases to avoid impulse buying.". Do not be conversational, just provide the single sentence tip.

Generate one financial tip.`;
      
      const responseText = await api.getAiInsight(prompt);
      setTip(responseText);

    } catch (err) {
       setError(err instanceof Error ? err.message : "Could not fetch a tip right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>Finding a helpful tip...</span>
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
    if (tip) {
      return (
         <p className="text-gray-700 font-medium">{tip}</p>
      );
    }
    return null;
  }

  return (
    <Card className="h-full">
        <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-full text-brand-secondary flex-shrink-0">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Daily Financial Tip</h3>
                    </div>
                </div>
                <div className="text-sm mt-1 flex-grow flex items-center">{renderContent()}</div>
            </div>
            <button
                onClick={fetchTip}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Get new tip"
            >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
    </Card>
  );
};

export default FinancialTipsFeed;