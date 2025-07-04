
import React from 'react';
import { useTrading } from '../../contexts/TradingContext';

export const ConnectionStatus: React.FC = () => {
  const { connectionStatus } = useTrading();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-300">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="capitalize">{connectionStatus}</span>
    </div>
  );
};
