
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { WebSocketService, MarketData, OrderBookData, PositionData } from '../services/WebSocketService';

interface TradingContextType {
  marketData: Record<string, MarketData>;
  orderBook: OrderBookData | null;
  positions: PositionData[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  placeOrder: (order: any) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

interface TradingProviderProps {
  children: ReactNode;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
  const [wsService] = useState(() => new WebSocketService({ 
    url: 'wss://api.delta.exchange/v2/ws' // This would be your actual WebSocket URL
  }));
  
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [subscribedSymbols] = useState(new Set<string>());

  useEffect(() => {
    const initializeConnection = async () => {
      setConnectionStatus('connecting');
      try {
        await wsService.connect();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeConnection();

    // Subscribe to market data updates
    const unsubscribeMarketData = wsService.subscribe('market_data', (data: MarketData) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    });

    // Subscribe to order book updates
    const unsubscribeOrderBook = wsService.subscribe('order_book', (data: OrderBookData) => {
      setOrderBook(data);
    });

    // Subscribe to position updates
    const unsubscribePositions = wsService.subscribe('positions', (data: PositionData[]) => {
      setPositions(data);
    });

    return () => {
      unsubscribeMarketData();
      unsubscribeOrderBook();
      unsubscribePositions();
      wsService.disconnect();
    };
  }, [wsService]);

  const subscribeToSymbol = useCallback((symbol: string) => {
    if (!subscribedSymbols.has(symbol)) {
      subscribedSymbols.add(symbol);
      wsService.send({
        type: 'subscribe',
        channel: 'market_data',
        symbol: symbol
      });
    }
  }, [wsService, subscribedSymbols]);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (subscribedSymbols.has(symbol)) {
      subscribedSymbols.delete(symbol);
      wsService.send({
        type: 'unsubscribe',
        channel: 'market_data',
        symbol: symbol
      });
    }
  }, [wsService, subscribedSymbols]);

  const placeOrder = useCallback((order: any) => {
    wsService.send({
      type: 'place_order',
      data: order
    });
  }, [wsService]);

  const value: TradingContextType = {
    marketData,
    orderBook,
    positions,
    connectionStatus,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    placeOrder
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = (): TradingContextType => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
