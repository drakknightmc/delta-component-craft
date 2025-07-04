
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const TradingChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { subscribeToSymbol, marketData } = useTrading();
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState('1m');

  useEffect(() => {
    subscribeToSymbol(symbol);
  }, [symbol, subscribeToSymbol]);

  // Mock chart data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const data: CandlestickData[] = [];
      let price = 65000;
      const now = Date.now();
      
      for (let i = 100; i >= 0; i--) {
        const change = (Math.random() - 0.5) * 1000;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 200;
        const low = Math.min(open, close) - Math.random() * 200;
        
        data.push({
          time: now - i * 60000,
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000000
        });
        
        price = close;
      }
      
      setChartData(data);
    };

    generateMockData();
  }, []);

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{symbol}</h3>
          <div className="flex space-x-1">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            ${marketData[symbol]?.price?.toFixed(2) || '0.00'}
          </div>
          <div className={`text-sm ${
            (marketData[symbol]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {marketData[symbol]?.change?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>
      
      <div className="h-96 bg-black rounded flex items-center justify-center">
        <div className="text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-2">📈</div>
            <div>Chart Component</div>
            <div className="text-sm">Connect to TradingView or Chart.js</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
