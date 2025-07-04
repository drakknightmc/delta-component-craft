
/**
 * Trading Chart Component
 * 
 * INTEGRATION GUIDE:
 * 1. This component subscribes to ticker data for the given symbol
 * 2. Replace the placeholder content with your preferred charting library
 * 3. Popular options: TradingView Charting Library, Chart.js, D3.js
 * 4. The subscription provides real-time price updates for live chart updates
 */

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

export const TradingChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { subscribeToTicker, marketData } = useTrading();

  useEffect(() => {
    // Subscribe to ticker updates for this symbol
    const unsubscribe = subscribeToTicker(symbol, (data) => {
      console.log(`Chart: Ticker update for ${symbol}:`, data);
      // TODO: Update your chart with the new ticker data
    });

    return unsubscribe;
  }, [symbol, subscribeToTicker]);

  const currentData = marketData[symbol];

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{symbol}</h3>
          <div className="flex space-x-1">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            ${currentData?.price?.toFixed(2) || '--'}
          </div>
          <div className={`text-sm ${
            (currentData?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentData?.changePercent?.toFixed(2) || '--'}%
          </div>
        </div>
      </div>
      
      <div className="h-96 bg-black rounded flex items-center justify-center border border-gray-700">
        <div className="text-gray-400 text-center">
          <div className="text-6xl mb-4">📈</div>
          <div className="text-xl mb-2">Chart Placeholder</div>
          <div className="text-sm text-gray-500 max-w-md">
            Integrate your preferred charting library here (TradingView, Chart.js, etc.)
            <br />
            Real-time data available via subscribeToTicker callback
          </div>
          {currentData && (
            <div className="mt-4 p-3 bg-gray-800 rounded text-left text-xs">
              <div>Symbol: {currentData.symbol}</div>
              <div>Price: ${currentData.price}</div>
              <div>Volume: {currentData.volume}</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
