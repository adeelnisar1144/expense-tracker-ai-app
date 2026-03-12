import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings, User } from '../types';

const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  language: 'en',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  const [settings, setSettings] = useLocalStorage<Settings>(
    'settings',
    DEFAULT_SETTINGS,
    user?.email || null
  );

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatCurrency = useMemo(() => (amount: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      ...options,
    }).format(amount);
  }, [settings.currency]);

  const value = {
    settings,
    updateSettings,
    formatCurrency,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};