import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Expense } from '../types';
import Card from './common/Card';
import { TrendingUp, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface ExpenseForecastProps {
  expenses: Expense[];
}

interface Forecast {
    forecastedAmount: number;
    explanation: string;
}

const ExpenseForecast: React.FC<ExpenseForecastProps> = ({ expenses }) => {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, formatCurrency } = useSettings();

  const fetchForecast = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    if (expenses.length < 5) {
        setForecast({ forecastedAmount: 0, explanation: "Not enough data for a forecast. Keep logging expenses!" });
        setIsLoading(false);
        return;
    }

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const recentExpenses = expenses.filter(e => new Date(e.date) > ninetyDaysAgo);

      const contextData = JSON.stringify({
        expenses: recentExpenses.map(({ id, ...rest }) => rest),
      });
      
      const prompt = `System Instruction:
You are a financial forecasting model for an app called BudgetFlow. Your task is to predict the user's total spending for the next 30 days based on their recent transaction history. Provide your answer ONLY as a valid JSON object. The JSON object must have two keys: "forecastedAmount" (a number representing the predicted total expense) and "explanation" (a very brief, one-sentence explanation for the forecast, e.g., "Based on your recent spending patterns."). The current date is ${new Date().toDateString()}. All monetary values are in ${settings.currency}. Do not include any other text, greetings, or markdown formatting outside of the JSON object.

User's Financial Data (last 90 days):
${contextData}

Generate the forecast JSON.`;
      
      const responseText = await api.getAiInsight(prompt);
      
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedForecast: Forecast = JSON.parse(cleanedResponse);

      setForecast(parsedForecast);

    } catch (err) {
       console.error("Forecast parsing error:", err);
       setError("Couldn't generate a forecast at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [expenses, settings.currency]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>Calculating your future spending...</span>
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
    if (forecast) {
      return (
        <div>
            <p className="text-3xl font-bold text-brand-primary">~ {formatCurrency(forecast.forecastedAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{forecast.explanation}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <Card className="h-full">
        <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-brand-primary flex-shrink-0">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">30-Day Forecast</h3>
                    </div>
                </div>
                <div className="mt-1 flex-grow flex items-center">{renderContent()}</div>
            </div>
            <button
                onClick={fetchForecast}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Recalculate forecast"
            >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>
    </Card>
  );
};

export default ExpenseForecast;
