import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition sm:text-sm";
  
  return (
    <input
      {...props}
      className={`${baseClasses} ${className}`}
    />
  );
};

export default Input;