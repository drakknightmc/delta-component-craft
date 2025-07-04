
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTrading } from '../../contexts/TradingContext';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { orderBook, subscribeToSymbol } = useTrading();
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);

  useEffect(() => {
    subscribeToSymbol(symbol);
  }, [symbol, subscribeToSymbol]);

  // Generate mock order book data
  useEffect(() => {
    const generateMockOrderBook = () => {
      const basePrice = 65000;
      const mockBids: OrderBookEntry[] = [];
      const mockAsks: OrderBookEntry[] = [];
      
      let runningTotalBids = 0;
      let runningTotalAsks = 0;
      
      for (let i = 0; i < 15; i++) {
        const bidPrice = basePrice - (i + 1) * 10;
        const bidSize = Math.random() * 2 + 0.1;
        runningTotalBids += bidSize;
        
        mockBids.push({
          price: bidPrice,
          size: bidSize,
          total: runningTotalBids
        });
        
        const askPrice = basePrice + (i + 1) * 10;
        const askSize = Math.random() * 2 + 0.1;
        runningTotalAsks += askSize;
        
        mockAsks.unshift({
          price: askPrice,
          size: askSize,
          total: runningTotalAsks
        });
      }
      
      setBids(mockBids);
      setAsks(mockAsks);
    };

    generateMockOrderBook();
    const interval = setInterval(generateMockOrderBook, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price.toFixed(1);
  const formatSize = (size: number) => size.toFixed(3);

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
        {asks.map((ask, index) => (
          <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-xs py-0.5 hover:bg-gray-800">
            <div className="text-red-400">{formatPrice(ask.price)}</div>
            <div className="text-right text-white">{formatSize(ask.size)}</div>
            <div className="text-right text-gray-400">{formatSize(ask.total)}</div>
          </div>
        ))}
        
        {/* Spread */}
        <div className="py-2 my-2 border-t border-b border-gray-700">
          <div className="text-center text-yellow-400 text-sm font-semibold">
            Spread: ${((asks[asks.length - 1]?.price || 0) - (bids[0]?.price || 0)).toFixed(1)}
          </div>
        </div>
        
        {/* Bids (Buy Orders) */}
        {bids.map((bid, index) => (
          <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-xs py-0.5 hover:bg-gray-800">
            <div className="text-green-400">{formatPrice(bid.price)}</div>
            <div className="text-right text-white">{formatSize(bid.size)}</div>
            <div className="text-right text-gray-400">{formatSize(bid.total)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
