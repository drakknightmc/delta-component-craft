
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

interface OptionData {
  strike: number;
  callBid: number;
  callAsk: number;
  callLast: number;
  callChange: number;
  callVolume: number;
  putBid: number;
  putAsk: number;
  putLast: number;
  putChange: number;
  putVolume: number;
  expiry: string;
}

export const OptionsChain: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { subscribeToSymbol } = useTrading();
  const [optionsData, setOptionsData] = useState<OptionData[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState('28 Jun 25');

  useEffect(() => {
    subscribeToSymbol(symbol);
  }, [symbol, subscribeToSymbol]);

  // Generate mock options data
  useEffect(() => {
    const generateMockOptions = () => {
      const basePrice = 65000;
      const strikes = [];
      
      for (let i = -10; i <= 10; i++) {
        const strike = basePrice + (i * 1000);
        strikes.push({
          strike,
          callBid: Math.max(0, basePrice - strike + Math.random() * 200 - 100),
          callAsk: Math.max(0, basePrice - strike + Math.random() * 200 - 50),
          callLast: Math.max(0, basePrice - strike + Math.random() * 200 - 75),
          callChange: (Math.random() - 0.5) * 20,
          callVolume: Math.floor(Math.random() * 1000),
          putBid: Math.max(0, strike - basePrice + Math.random() * 200 - 100),
          putAsk: Math.max(0, strike - basePrice + Math.random() * 200 - 50),
          putLast: Math.max(0, strike - basePrice + Math.random() * 200 - 75),
          putChange: (Math.random() - 0.5) * 20,
          putVolume: Math.floor(Math.random() * 1000),
          expiry: selectedExpiry
        });
      }
      
      setOptionsData(strikes);
    };

    generateMockOptions();
    const interval = setInterval(generateMockOptions, 5000);
    
    return () => clearInterval(interval);
  }, [selectedExpiry]);

  const formatPrice = (price: number) => price.toFixed(1);
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Options Chain</h3>
        <select 
          value={selectedExpiry}
          onChange={(e) => setSelectedExpiry(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
        >
          <option value="05 Jul 25">05 Jul 25</option>
          <option value="11 Jul 25">11 Jul 25</option>
          <option value="18 Jul 25">18 Jul 25</option>
          <option value="25 Jul 25">25 Jul 25</option>
          <option value="28 Jun 25">28 Jun 25</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Strike</th>
              <th className="text-right py-2 text-green-400">Call Bid</th>
              <th className="text-right py-2 text-green-400">Call Ask</th>
              <th className="text-right py-2 text-green-400">Call Last</th>
              <th className="text-right py-2 text-green-400">Call Chg%</th>
              <th className="text-right py-2 text-green-400">Call Vol</th>
              <th className="text-right py-2 text-red-400">Put Bid</th>
              <th className="text-right py-2 text-red-400">Put Ask</th>
              <th className="text-right py-2 text-red-400">Put Last</th>
              <th className="text-right py-2 text-red-400">Put Chg%</th>
              <th className="text-right py-2 text-red-400">Put Vol</th>
            </tr>
          </thead>
          <tbody>
            {optionsData.map((option, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-1 text-white font-semibold">{option.strike}</td>
                <td className="text-right py-1 text-green-400">{formatPrice(option.callBid)}</td>
                <td className="text-right py-1 text-green-400">{formatPrice(option.callAsk)}</td>
                <td className="text-right py-1 text-green-400">{formatPrice(option.callLast)}</td>
                <td className={`text-right py-1 ${option.callChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatChange(option.callChange)}
                </td>
                <td className="text-right py-1 text-gray-300">{option.callVolume}</td>
                <td className="text-right py-1 text-red-400">{formatPrice(option.putBid)}</td>
                <td className="text-right py-1 text-red-400">{formatPrice(option.putAsk)}</td>
                <td className="text-right py-1 text-red-400">{formatPrice(option.putLast)}</td>
                <td className={`text-right py-1 ${option.putChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatChange(option.putChange)}
                </td>
                <td className="text-right py-1 text-gray-300">{option.putVolume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
