
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrading } from '../../contexts/TradingContext';
import { toast } from 'sonner';

export const OrderPanel: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { placeOrder, marketData } = useTrading();
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const handlePlaceOrder = () => {
    if (!quantity || (orderType === 'limit' && !price)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const order = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      ...(orderType === 'limit' && { price: parseFloat(price) })
    };

    placeOrder(order);
    toast.success(`${side.toUpperCase()} order placed for ${quantity} ${symbol}`);
    
    // Reset form
    setQuantity('');
    setPrice('');
  };

  const currentPrice = marketData[symbol]?.price || 0;

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
      
      <div className="space-y-4">
        {/* Order Type */}
        <div className="flex space-x-2">
          <Button
            variant={orderType === 'market' ? 'default' : 'outline'}
            onClick={() => setOrderType('market')}
            className="flex-1"
          >
            Market
          </Button>
          <Button
            variant={orderType === 'limit' ? 'default' : 'outline'}
            onClick={() => setOrderType('limit')}
            className="flex-1"
          >
            Limit
          </Button>
        </div>

        {/* Buy/Sell */}
        <div className="flex space-x-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            onClick={() => setSide('buy')}
            className={`flex-1 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            onClick={() => setSide('sell')}
            className={`flex-1 ${side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            Sell
          </Button>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Quantity</label>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="bg-gray-800 border-gray-600"
            type="number"
            step="0.001"
          />
        </div>

        {/* Price (only for limit orders) */}
        {orderType === 'limit' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Price</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="bg-gray-800 border-gray-600"
              type="number"
              step="0.1"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-800 p-3 rounded space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Order Value:</span>
            <span className="text-white">
              ${((parseFloat(quantity) || 0) * (orderType === 'limit' ? parseFloat(price) || 0 : currentPrice)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available Margin:</span>
            <span className="text-green-400">$103.01</span>
          </div>
        </div>

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className={`w-full ${
            side === 'buy' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </Button>
      </div>
    </Card>
  );
};
