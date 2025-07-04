
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { WebSocketService, DeltaTickerData, DeltaOrderBookData, DeltaTradeData } from '../services/WebSocketService';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  open: number;
}

interface OrderBookData {
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  symbol: string;
}

interface PositionData {
  symbol: string;
  size: number;
  avgPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

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
    url: 'wss://production-esocket.delta.exchange:8080'
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
        
        // Subscribe to ticker data for all symbols
        wsService.subscribeToChannel('v2/ticker');
        
      } catch (error) {
        console.error('Failed to connect to Delta Exchange WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeConnection();

    // Subscribe to ticker updates
    const unsubscribeTicker = wsService.subscribe('v2/ticker', (message: any) => {
      if (message.data) {
        message.data.forEach((tickerData: DeltaTickerData) => {
          const price = parseFloat(tickerData.price);
          const open = parseFloat(tickerData.open);
          const change = price - open;
          const changePercent = open > 0 ? (change / open) * 100 : 0;
          
          setMarketData(prev => ({
            ...prev,
            [tickerData.symbol]: {
              symbol: tickerData.symbol,
              price: price,
              change: change,
              changePercent: changePercent,
              volume: parseFloat(tickerData.volume),
              high24h: parseFloat(tickerData.high),
              low24h: parseFloat(tickerData.low),
              open: open
            }
          }));
        });
      }
    });

    // Subscribe to order book updates
    const unsubscribeOrderBook = wsService.subscribe('l2_orderbook', (message: any) => {
      if (message.data) {
        message.data.forEach((obData: DeltaOrderBookData) => {
          setOrderBook({
            symbol: obData.symbol,
            bids: obData.buy.map(item => [parseFloat(item.price), parseFloat(item.size)]),
            asks: obData.sell.map(item => [parseFloat(item.price), parseFloat(item.size)])
          });
        });
      }
    });

    // Subscribe to trade updates
    const unsubscribeTrades = wsService.subscribe('l1_tradebook', (message: any) => {
      if (message.data) {
        message.data.forEach((tradeData: DeltaTradeData) => {
          console.log('Trade update:', tradeData);
          // Handle trade data updates here
        });
      }
    });

    return () => {
      unsubscribeTicker();
      unsubscribeOrderBook();
      unsubscribeTrades();
      wsService.disconnect();
    };
  }, [wsService]);

  const subscribeToSymbol = useCallback((symbol: string) => {
    if (!subscribedSymbols.has(symbol)) {
      subscribedSymbols.add(symbol);
      
      // Subscribe to order book for specific symbol
      wsService.subscribeToChannel(`l2_orderbook:${symbol}`);
      
      // Subscribe to trades for specific symbol
      wsService.subscribeToChannel(`l1_tradebook:${symbol}`);
      
      console.log(`Subscribed to Delta channels for ${symbol}`);
    }
  }, [wsService, subscribedSymbols]);

  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (subscribedSymbols.has(symbol)) {
      subscribedSymbols.delete(symbol);
      
      // Unsubscribe from symbol-specific channels
      wsService.unsubscribeFromChannel(`l2_orderbook:${symbol}`);
      wsService.unsubscribeFromChannel(`l1_tradebook:${symbol}`);
      
      console.log(`Unsubscribed from Delta channels for ${symbol}`);
    }
  }, [wsService, subscribedSymbols]);

  const placeOrder = useCallback((order: any) => {
    // This would require authentication and proper order format
    console.log('Order placement would require authentication:', order);
    // wsService.send({ type: 'place_order', data: order });
  }, []);

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
