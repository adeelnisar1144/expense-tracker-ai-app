
import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, X, Info } from 'lucide-react';

interface AlertsProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const Alerts: React.FC<AlertsProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return null;
  }

  const alertConfig = {
    warning: {
      bgColor: 'bg-yellow-100 border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      Icon: AlertTriangle,
    },
    error: {
      bgColor: 'bg-red-100 border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      Icon: AlertTriangle,
    },
    info: {
      bgColor: 'bg-blue-100 border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      Icon: Info,
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {alerts.map(alert => {
        const config = alertConfig[alert.type];
        const { Icon } = config;

        return (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${config.bgColor}`}
            role="alert"
          >
            <div className="flex items-center">
              <Icon className={`h-5 w-5 ${config.iconColor} mr-3`} />
              <span className={`text-sm font-medium ${config.textColor}`}>
                {alert.message}
              </span>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className={`p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors ${config.textColor}`}
              aria-label="Dismiss alert"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Alerts;
