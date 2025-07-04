
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTrading } from '../../contexts/TradingContext';

interface MarketSymbol {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
}

export const MarketDataTable: React.FC = () => {
  const { subscribeToSymbol } = useTrading();
  const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');

  useEffect(() => {
    // Generate mock market data
    const generateMockData = () => {
      const mockSymbols = [
        'BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'BNB-USDT', 'ADA-USDT',
        'DOT-USDT', 'LINK-USDT', 'AVAX-USDT', 'MATIC-USDT', 'UNI-USDT'
      ];

      const data = mockSymbols.map(symbol => {
        const basePrice = Math.random() * 10000 + 1000;
        const change = (Math.random() - 0.5) * 1000;
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol,
          price: basePrice,
          change,
          changePercent,
          volume: Math.random() * 10000000,
          high24h: basePrice + Math.random() * 500,
          low24h: basePrice - Math.random() * 500
        };
      });

      setSymbols(data);
      
      // Subscribe to all symbols
      data.forEach(s => subscribeToSymbol(s.symbol));
    };

    generateMockData();
    const interval = setInterval(generateMockData, 3000);
    
    return () => clearInterval(interval);
  }, [subscribeToSymbol]);

  const filteredSymbols = symbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
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
            {filteredSymbols.map((symbol, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                onClick={() => console.log('Selected symbol:', symbol.symbol)}
              >
                <td className="py-2 text-white font-semibold">{symbol.symbol}</td>
                <td className="text-right py-2 text-white">${symbol.price.toFixed(2)}</td>
                <td className={`text-right py-2 ${symbol.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {symbol.change >= 0 ? '+' : ''}{symbol.change.toFixed(2)}
                </td>
                <td className={`text-right py-2 ${symbol.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {symbol.changePercent >= 0 ? '+' : ''}{symbol.changePercent.toFixed(2)}%
                </td>
                <td className="text-right py-2 text-gray-300">
                  {(symbol.volume / 1000000).toFixed(2)}M
                </td>
                <td className="text-right py-2 text-white">${symbol.high24h.toFixed(2)}</td>
                <td className="text-right py-2 text-white">${symbol.low24h.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
