
import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { Expense, Budget, SavingsGoal, RecurringTransaction, ChatMessage } from '../types';
import Modal from './Modal';
import Input from './common/Input';
import { Send, Bot, User as UserIcon, Loader2, WifiOff } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    expenses: Expense[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    recurringTransactions: RecurringTransaction[];
  };
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, data }) => {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your AI financial assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOnline = useNetworkStatus();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (!isOnline) {
        setMessages(prev => [...prev, { role: 'model', content: "I'm offline right now. Please check your internet connection." }]);
        return;
    }

    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const recentExpenses = data.expenses.filter(e => {
        const date = new Date(e.date);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return date > ninetyDaysAgo;
      });

      const contextData = JSON.stringify({
        expenses: recentExpenses.map(({id, ...rest}) => rest), // Remove IDs for privacy/brevity
        budgets: data.budgets.map(({id, ...rest}) => rest),
        savingsGoals: data.savingsGoals.map(({id, ...rest}) => rest),
        recurringTransactions: data.recurringTransactions.map(({id, ...rest}) => rest),
      });
      
      const prompt = `System Instruction:
You are "BudgetFlow AI", a friendly and intelligent financial assistant. Your role is to analyze the user's financial data and provide clear, concise answers to their questions. The user's data is provided in JSON format. The current date is ${new Date().toDateString()}. All monetary values are in ${settings.currency}. Do not output JSON code blocks unless specifically asked. Format monetary values nicely and directly answer the user's question based on the provided data.

User's Financial Data:
${contextData}

User's Question:
${userMessage.content}`;
      
      const responseText = await api.getAiInsight(prompt);
      const modelMessage: ChatMessage = { role: 'model', content: responseText };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : "Sorry, something went wrong." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white"><Bot size={20} /></div>}
            <div className={`max-w-md rounded-xl px-4 py-3 text-sm ${isUser ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                {message.content}
            </div>
             {isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600"><UserIcon size={20} /></div>}
        </div>
    )
  }

  if (!isOnline) {
      return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Financial Assistant">
            <div className="flex flex-col items-center justify-center h-[40vh] text-center p-6">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <WifiOff size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">You are offline</h3>
                <p className="text-gray-500 mt-2">The AI assistant requires an internet connection to work. Please check your network and try again.</p>
            </div>
        </Modal>
      )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Financial Assistant">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white"><Loader2 size={20} className="animate-spin" /></div>
                <div className="max-w-md rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-800">
                    Thinking...
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-grow"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-brand-primary text-white p-2 rounded-md disabled:bg-gray-400 transition-colors"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ChatbotModal;
