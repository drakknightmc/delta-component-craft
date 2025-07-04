
/**
 * Market Data Table Component
 * 
 * INTEGRATION GUIDE:
 * 1. Add your list of symbols to subscribe to ticker data
 * 2. Real market data will populate the table automatically
 * 3. Data updates in real-time via WebSocket subscriptions
 * 4. Add symbols to the SYMBOLS array below to start receiving data
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTrading } from '../../contexts/TradingContext';

// TODO: Replace with your actual symbols
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT',
  'DOTUSDT', 'LINKUSDT', 'AVAXUSDT', 'MATICUSDT', 'UNIUSDT'
];

export const MarketDataTable: React.FC = () => {
  const { subscribeToTicker, marketData } = useTrading();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');

  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to ticker data for all symbols
    SYMBOLS.forEach(symbol => {
      const unsubscribe = subscribeToTicker(symbol, (data) => {
        console.log(`MarketTable: Ticker update for ${symbol}:`, data);
        // Real data will automatically update the marketData state in TradingContext
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribeToTicker]);

  // Filter symbols based on search term and available data
  const availableSymbols = SYMBOLS.filter(symbol =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <h3 className="text-lg font-semibold text-white">Markets</h3>
          <div className="flex space-x-2">
            {['All', 'Favorites', 'BTC', 'ETH'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <Input
          placeholder="Search markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 bg-gray-800 border-gray-600"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Symbol</th>
              <th className="text-right py-2 text-gray-400">Price</th>
              <th className="text-right py-2 text-gray-400">Change</th>
              <th className="text-right py-2 text-gray-400">Change %</th>
              <th className="text-right py-2 text-gray-400">Volume</th>
              <th className="text-right py-2 text-gray-400">High 24h</th>
              <th className="text-right py-2 text-gray-400">Low 24h</th>
            </tr>
          </thead>
          <tbody>
            {availableSymbols.map((symbol) => {
              const data = marketData[symbol];
              return (
                <tr 
                  key={symbol} 
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                  onClick={() => console.log('Selected symbol:', symbol)}
                >
                  <td className="py-2 text-white font-semibold">{symbol}</td>
                  <td className="text-right py-2 text-white">
                    {data ? `$${data.price.toFixed(2)}` : '--'}
                  </td>
                  <td className={`text-right py-2 ${
                    data && data.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data ? `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}` : '--'}
                  </td>
                  <td className={`text-right py-2 ${
                    data && data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data ? `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%` : '--'}
                  </td>
                  <td className="text-right py-2 text-gray-300">
                    {data ? `${(data.volume / 1000000).toFixed(2)}M` : '--'}
                  </td>
                  <td className="text-right py-2 text-white">
                    {data ? `$${data.high24h.toFixed(2)}` : '--'}
                  </td>
                  <td className="text-right py-2 text-white">
                    {data ? `$${data.low24h.toFixed(2)}` : '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {availableSymbols.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No symbols match your search
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <strong>Integration Status:</strong> {Object.keys(marketData).length} symbols receiving data
        <br />
        <strong>Next Step:</strong> Update SYMBOLS array and integrate WebSocket data parsing
      </div>
    </Card>
  );
};
