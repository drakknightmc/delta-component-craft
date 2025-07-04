
/**
 * Order Book Component
 * 
 * INTEGRATION GUIDE:
 * 1. This component subscribes to l2_orderbook data for the given symbol
 * 2. Real order book data will populate the bids and asks arrays
 * 3. Data format: { bids: [[price, size]], asks: [[price, size]] }
 * 4. The component auto-updates when new order book data arrives
 */

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

export const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { subscribeToOrderBook, orderBooks } = useTrading();

  useEffect(() => {
    // Subscribe to order book updates for this symbol
    const unsubscribe = subscribeToOrderBook(symbol, (data) => {
      console.log(`OrderBook: Update for ${symbol}:`, data);
      // Real data will automatically update the orderBooks state in TradingContext
    });

    return unsubscribe;
  }, [symbol, subscribeToOrderBook]);

  const orderBook = orderBooks[symbol];
  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];

  const formatPrice = (price: number) => price?.toFixed(1) || '--';
  const formatSize = (size: number) => size?.toFixed(3) || '--';

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Order Book</h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-semibold">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>
      </div>
      
      <div className="space-y-0.5">
        {/* Asks (Sell Orders) */}
        <div className="max-h-48 overflow-y-auto">
          {asks.length > 0 ? asks.slice(0, 15).map((ask, index) => (
            <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-xs py-0.5 hover:bg-gray-800">
              <div className="text-red-400">{formatPrice(ask[0])}</div>
              <div className="text-right text-white">{formatSize(ask[1])}</div>
              <div className="text-right text-gray-400">--</div>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500 text-xs">
              No ask data - integrate WebSocket subscription
            </div>
          )}
        </div>
        
        {/* Spread */}
        <div className="py-2 my-2 border-t border-b border-gray-700">
          <div className="text-center text-yellow-400 text-sm font-semibold">
            {asks.length > 0 && bids.length > 0 
              ? `Spread: $${(asks[asks.length - 1][0] - bids[0][0]).toFixed(1)}`
              : 'Spread: --'
            }
          </div>
        </div>
        
        {/* Bids (Buy Orders) */}
        <div className="max-h-48 overflow-y-auto">
          {bids.length > 0 ? bids.slice(0, 15).map((bid, index) => (
            <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-xs py-0.5 hover:bg-gray-800">
              <div className="text-green-400">{formatPrice(bid[0])}</div>
              <div className="text-right text-white">{formatSize(bid[1])}</div>
              <div className="text-right text-gray-400">--</div>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500 text-xs">
              No bid data - integrate WebSocket subscription
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
