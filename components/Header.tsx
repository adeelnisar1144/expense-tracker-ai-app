import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import Button from './common/Button';
import { User } from '../types';
import Logo from './common/Logo';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSettings }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <Logo size="small" theme="light" />
      <div className="flex items-center gap-3 mt-4 sm:mt-0">
        <div className="hidden sm:block text-sm" aria-label={`Welcome, ${user.name}`}>
          <span className="text-gray-500">Welcome, </span>
          <span className="font-semibold text-gray-900">{user.name}</span>
        </div>
        <button 
          onClick={onOpenSettings} 
          className="text-gray-500 hover:text-brand-primary transition-colors p-2 rounded-full hover:bg-gray-200"
          aria-label="Open Settings"
        >
            <Settings size={20} />
        </button>
        <Button onClick={onLogout} variant="secondary" className="px-3 py-2 text-sm">
          <LogOut size={16} className="inline-block mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;