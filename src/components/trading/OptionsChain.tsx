
/**
 * Options Chain Component
 * 
 * INTEGRATION GUIDE:
 * 1. This component shows options data for the given symbol
 * 2. Delta Exchange may have specific options channels - check their documentation
 * 3. Options data typically comes from separate WebSocket channels
 * 4. Update the subscription method once you identify the correct channel
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

export const OptionsChain: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { wsService } = useTrading();
  const [selectedExpiry, setSelectedExpiry] = useState('28 Jun 25');

  // TODO: Implement options data subscription
  // useEffect(() => {
  //   const unsubscribe = wsService.subscribe('options_channel', symbol, (data) => {
  //     console.log('Options data:', data);
  //   });
  //   return unsubscribe;
  // }, [symbol, wsService]);

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
            <tr>
              <td colSpan={11} className="text-center py-12 text-gray-400">
                <div className="text-lg mb-2">Options Data Placeholder</div>
                <div className="text-sm text-gray-500">
                  Check Delta Exchange documentation for options WebSocket channels
                  <br />
                  Subscribe to the appropriate channel and update this component
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <strong>Options Integration:</strong> Check Delta Exchange docs for options channels
        <br />
        <strong>Symbol:</strong> {symbol} | <strong>Expiry:</strong> {selectedExpiry}
      </div>
    </Card>
  );
};
