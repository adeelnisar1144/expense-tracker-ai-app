
import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium shadow-md animate-fade-in-delayed">
      <WifiOff size={18} />
      <span>You are currently offline. Changes are saved locally, but AI features are unavailable.</span>
    </div>
  );
};

export default OfflineBanner;
