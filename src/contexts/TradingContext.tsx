/**
 * Trading Context
 * 
 * This context provides a clean interface for integrating with Delta Exchange WebSocket data.
 * All mock data has been removed - you need to integrate real WebSocket subscriptions.
 * 
 * INTEGRATION GUIDE:
 * 
 * 1. Market Data (Ticker):
 *    - Subscribe to 'v2/ticker' channel for specific symbols
 *    - Data format: { symbol, price, open, high, low, close, volume, change, timestamp }
 * 
 * 2. Order Book:
 *    - Subscribe to 'l2_orderbook' channel for specific symbols  
 *    - Data format: { symbol, buy: [{price, size}], sell: [{price, size}] }
 * 
 * 3. Trades:
 *    - Subscribe to 'l1_tradebook' channel for specific symbols
 *    - Data format: { symbol, price, size, side, timestamp }
 * 
 * 4. Positions:
 *    - This requires authenticated WebSocket connection
 *    - You'll need to implement authentication first
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { WebSocketService } from '../services/WebSocketService';

// Data interfaces - these match Delta Exchange response formats
interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  open: number;
  timestamp: number;
}

interface OrderBookData {
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>; // [price, size]
  symbol: string;
  timestamp: number;
}

interface TradeData {
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface PositionData {
  symbol: string;
  size: number;
  avgPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  margin: number;
}

interface TradingContextType {
  // Connection status
  connectionStatus: 'connecting' | 'connected' | 'disconnected';

  // Data stores - will be empty until you integrate WebSocket subscriptions
  marketData: Record<string, MarketData>;
  orderBooks: Record<string, OrderBookData>;
  trades: Record<string, TradeData[]>;
  positions: PositionData[];

  // Subscription management
  subscribeToTicker: (symbol: string[], callback?: (data: any) => void) => () => void;
  subscribeToOrderBook: (symbol: string[], callback?: (data: any) => void) => () => void;
  subscribeToTrades: (symbol: string[], callback?: (data: any) => void) => () => void;

  // WebSocket service for direct access
  wsService: WebSocketService;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

interface TradingProviderProps {
  children: ReactNode;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
  const [wsService] = useState(() => new WebSocketService({
    url: 'wss://socket.delta.exchange'
  }));

  // Data stores
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBookData>>({});
  const [trades, setTrades] = useState<Record<string, TradeData[]>>({});
  const [positions, setPositions] = useState<PositionData[]>([]);

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      setConnectionStatus('connecting');
      try {
        await wsService.connect();
        setConnectionStatus('connected');
        console.log('Trading Context: WebSocket connected successfully');
      } catch (error) {
        console.error('Trading Context: Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeConnection();

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  /**
   * Subscribe to ticker data for a specific symbol
   * 
   * INTEGRATION EXAMPLE:
   * const unsubscribe = subscribeToTicker('BTCUSDT', (data) => {
   *   console.log('Ticker update:', data);
   *   // data.data contains: { symbol, price, open, high, low, close, volume, change, timestamp }
   * });
   */
  const subscribeToTicker = useCallback((symbol: string[], callback?: (data: any) => void) => {
    const unsubscribe = wsService.subscribe('v2/ticker', symbol, (data) => {
      // TODO: Update marketData state when you integrate real data
      // Example:
      console.log(`Ticker update for ${symbol}:`, data);
      const tickerData = data.data;
      // setMarketData(prev => ({
      //   ...prev,
      //   [symbol]: {
      //     symbol: tickerData.symbol,
      //     price: parseFloat(tickerData.price),
      //     change: parseFloat(tickerData.change),
      //     changePercent: parseFloat(tickerData.change_percent),
      //     volume: parseFloat(tickerData.volume),
      //     high24h: parseFloat(tickerData.high),
      //     low24h: parseFloat(tickerData.low),
      //     open: parseFloat(tickerData.open),
      //     timestamp: tickerData.timestamp
      //   }
      // }));

      if (callback) callback(data);
    });

    return unsubscribe;
  }, [wsService]);

  /**
   * Subscribe to order book data for a specific symbol
   * 
   * INTEGRATION EXAMPLE:
   * const unsubscribe = subscribeToOrderBook('BTCUSDT', (data) => {
   *   console.log('Order book update:', data);
   *   // data.data contains: { symbol, buy: [{price, size}], sell: [{price, size}] }
   * });
   */
  const subscribeToOrderBook = useCallback((symbol: string[], callback?: (data: any) => void) => {
    const unsubscribe = wsService.subscribe('l2_orderbook', symbol, (data) => {
      // TODO: Update orderBooks state when you integrate real data
      // Example:
      // const obData = data.data;
      // setOrderBooks(prev => ({
      //   ...prev,
      //   [symbol]: {
      //     bids: obData.buy.map(item => [parseFloat(item.price), parseFloat(item.size)]),
      //     asks: obData.sell.map(item => [parseFloat(item.price), parseFloat(item.size)]),
      //     symbol: obData.symbol,
      //     timestamp: Date.now()
      //   }
      // }));

      if (callback) callback(data);
    });

    return unsubscribe;
  }, [wsService]);

  /**
   * Subscribe to trade data for a specific symbol
   * 
   * INTEGRATION EXAMPLE:
   * const unsubscribe = subscribeToTrades('BTCUSDT', (data) => {
   *   console.log('Trade update:', data);
   *   // data.data contains: { symbol, price, size, side, timestamp }
   * });
   */
  const subscribeToTrades = useCallback((symbol: string[], callback?: (data: any) => void) => {
    const unsubscribe = wsService.subscribe('l1_tradebook', symbol, (data) => {
      // TODO: Update trades state when you integrate real data
      // Example:
      // const tradeData = data.data;
      // setTrades(prev => ({
      //   ...prev,
      //   [symbol]: [
      //     ...(prev[symbol] || []).slice(-99), // Keep last 100 trades
      //     {
      //       symbol: tradeData.symbol,
      //       price: parseFloat(tradeData.price),
      //       size: parseFloat(tradeData.size),
      //       side: tradeData.side,
      //       timestamp: tradeData.timestamp
      //     }
      //   ]
      // }));

      if (callback) callback(data);
    });

    return unsubscribe;
  }, [wsService]);

  const value: TradingContextType = {
    connectionStatus,
    marketData,
    orderBooks,
    trades,
    positions,
    subscribeToTicker,
    subscribeToOrderBook,
    subscribeToTrades,
    wsService
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
