
/**
 * Positions Panel Component
 * 
 * INTEGRATION GUIDE:
 * 1. This requires authenticated WebSocket connection to Delta Exchange
 * 2. You'll need to implement authentication first
 * 3. Subscribe to position updates channel (usually 'position' or similar)
 * 4. Update the TradingContext to handle position data
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTrading } from '../../contexts/TradingContext';

export const PositionsPanel: React.FC = () => {
  const { positions } = useTrading();

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Positions</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Close All Positions
          </Button>
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
            {positions.length > 0 ? positions.map((position, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-2 text-white font-semibold">{position.symbol}</td>
                <td className="text-right py-2 text-green-400">+{position.size}</td>
                <td className="text-right py-2 text-white">${position.avgPrice.toFixed(2)}</td>
                <td className="text-right py-2 text-white">--</td>
                <td className={`text-right py-2 ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${position.unrealizedPnl.toFixed(2)}
                </td>
                <td className="text-right py-2 text-white">${position.margin?.toFixed(2) || '--'}</td>
                <td className="text-right py-2">
                  <Button size="sm" variant="outline" className="text-xs" disabled>
                    Close
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  <div>No open positions</div>
                  <div className="text-xs mt-2 text-gray-500">
                    Requires authenticated WebSocket connection
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <strong>Authentication Required:</strong> Position data requires authenticated WebSocket connection
        <br />
        <strong>Next Step:</strong> Implement Delta Exchange authentication and subscribe to position updates
      </div>
    </Card>
  );
};
