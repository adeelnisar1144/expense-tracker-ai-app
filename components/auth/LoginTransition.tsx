import React, { useEffect } from 'react';
import Logo from '../common/Logo';
import { User } from '../../types';

interface LoginTransitionProps {
  user: User;
  onTransitionEnd: () => void;
}

const LoginTransition: React.FC<LoginTransitionProps> = ({ user, onTransitionEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTransitionEnd();
    }, 2500); // Animation duration

    return () => clearTimeout(timer);
  }, [onTransitionEnd]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="animate-scale-in-out">
        <Logo />
      </div>
      <div className="mt-8 text-center animate-fade-in-delayed">
        <h2 className="text-2xl font-semibold text-white">Welcome back, {user.name}!</h2>
        <p className="text-gray-400 mt-2">Getting your dashboard ready...</p>
      </div>
    </div>
  );
};

export default LoginTransition;
