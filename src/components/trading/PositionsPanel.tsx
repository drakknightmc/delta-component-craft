
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTrading } from '../../contexts/TradingContext';

export const PositionsPanel: React.FC = () => {
  const { positions } = useTrading();

  // Mock positions data
  const mockPositions = [
    {
      symbol: 'BTC-USDT',
      size: 0.084,
      avgPrice: 65725,
      markPrice: 65900,
      unrealizedPnl: 14.7,
      realizedPnl: -5.2,
      margin: 136.61,
      percentage: 2.23
    }
  ];

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Positions</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Close All Positions</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Symbol</th>
              <th className="text-right py-2 text-gray-400">Size</th>
              <th className="text-right py-2 text-gray-400">Avg Price</th>
              <th className="text-right py-2 text-gray-400">Mark Price</th>
              <th className="text-right py-2 text-gray-400">Unrealized PnL</th>
              <th className="text-right py-2 text-gray-400">Margin</th>
              <th className="text-right py-2 text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockPositions.map((position, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-2 text-white font-semibold">{position.symbol}</td>
                <td className="text-right py-2 text-green-400">+{position.size}</td>
                <td className="text-right py-2 text-white">${position.avgPrice.toFixed(2)}</td>
                <td className="text-right py-2 text-white">${position.markPrice.toFixed(2)}</td>
                <td className={`text-right py-2 ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${position.unrealizedPnl.toFixed(2)} ({position.percentage >= 0 ? '+' : ''}{position.percentage}%)
                </td>
                <td className="text-right py-2 text-white">${position.margin.toFixed(2)}</td>
                <td className="text-right py-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Close
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mockPositions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No open positions
        </div>
      )}
    </Card>
  );
};
