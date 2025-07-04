
# Delta Exchange WebSocket Integration Guide

## Overview
This trading dashboard provides a clean, scalable WebSocket architecture for integrating with Delta Exchange. All mock data has been removed, and the system is ready for real API integration.

## Architecture

### WebSocket Service (`src/services/WebSocketService.ts`)
- **Fine-grained subscriptions**: Each channel + symbol combination is tracked independently
- **Memory leak prevention**: Automatic cleanup and unsubscription management
- **Reconnection handling**: Automatic reconnection with exponential backoff
- **Subscription key format**: `channel:symbol` (e.g., `v2/ticker:BTCUSDT`)

### Trading Context (`src/contexts/TradingContext.tsx`)
- **Clean data stores**: Separate state for market data, order books, trades, positions
- **Subscription helpers**: Easy-to-use functions for subscribing to different data types
- **Type safety**: Full TypeScript interfaces matching Delta Exchange data formats

## Integration Steps

### 1. Basic Market Data (Ticker)
```javascript
// Subscribe to ticker for a specific symbol
const unsubscribe = subscribeToTicker('BTCUSDT', (data) => {
  console.log('Ticker update:', data);
  // data.data contains: { symbol, price, open, high, low, close, volume, change, timestamp }
});

// Unsubscribe when done
unsubscribe();
```

**Expected Delta Exchange Response Format:**
```json
{
  "type": "table",
  "table": "v2/ticker",
  "action": "partial|insert|update",
  "data": [{
    "symbol": "BTCUSDT",
    "price": "65000.50",
    "open": "64500.00",
    "high": "65200.00",
    "low": "64300.00",
    "close": "65000.50",
    "volume": "1234567.89",
    "change": "+500.50",
    "timestamp": 1625097600
  }]
}
```

### 2. Order Book Data
```javascript
// Subscribe to order book for a specific symbol
const unsubscribe = subscribeToOrderBook('BTCUSDT', (data) => {
  console.log('Order book update:', data);
  // data.data contains: { symbol, buy: [{price, size}], sell: [{price, size}] }
});
```

**Expected Delta Exchange Response Format:**
```json
{
  "type": "table",
  "table": "l2_orderbook",
  "action": "partial|insert|update|delete",
  "data": [{
    "symbol": "BTCUSDT",
    "buy": [
      {"price": "64999.50", "size": "0.1234"},
      {"price": "64999.00", "size": "0.5678"}
    ],
    "sell": [
      {"price": "65000.50", "size": "0.2345"},
      {"price": "65001.00", "size": "0.3456"}
    ]
  }]
}
```

### 3. Trade Data
```javascript
// Subscribe to trades for a specific symbol
const unsubscribe = subscribeToTrades('BTCUSDT', (data) => {
  console.log('Trade update:', data);
  // data.data contains: { symbol, price, size, side, timestamp }
});
```

### 4. Multiple Symbol Subscriptions
```javascript
// Subscribe to the same channel for different symbols independently
const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

const unsubscribeFunctions = symbols.map(symbol => 
  subscribeToTicker(symbol, (data) => {
    console.log(`Ticker for ${symbol}:`, data);
  })
);

// Cleanup all subscriptions
unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
```

## Data Integration Points

### Update Market Data State
In `src/contexts/TradingContext.tsx`, uncomment and modify the ticker subscription:

```javascript
const subscribeToTicker = useCallback((symbol: string, callback?: (data: any) => void) => {
  const unsubscribe = wsService.subscribe('v2/ticker', symbol, (data) => {
    const tickerData = data.data;
    setMarketData(prev => ({
      ...prev,
      [symbol]: {
        symbol: tickerData.symbol,
        price: parseFloat(tickerData.price),
        change: parseFloat(tickerData.change),
        changePercent: parseFloat(tickerData.change_percent || tickerData.change),
        volume: parseFloat(tickerData.volume),
        high24h: parseFloat(tickerData.high),
        low24h: parseFloat(tickerData.low),
        open: parseFloat(tickerData.open),
        timestamp: tickerData.timestamp
      }
    }));
    
    if (callback) callback(data);
  });
  
  return unsubscribe;
}, [wsService]);
```

### Update Order Book State
```javascript
const subscribeToOrderBook = useCallback((symbol: string, callback?: (data: any) => void) => {
  const unsubscribe = wsService.subscribe('l2_orderbook', symbol, (data) => {
    const obData = data.data;
    setOrderBooks(prev => ({
      ...prev,
      [symbol]: {
        bids: obData.buy.map(item => [parseFloat(item.price), parseFloat(item.size)]),
        asks: obData.sell.map(item => [parseFloat(item.price), parseFloat(item.size)]),
        symbol: obData.symbol,
        timestamp: Date.now()
      }
    }));
    
    if (callback) callback(data);
  });
  
  return unsubscribe;
}, [wsService]);
```

## Component Integration

### Market Data Table
- Update `SYMBOLS` array in `src/components/trading/MarketDataTable.tsx`
- Add your trading symbols to start receiving ticker data

### Trading Chart
- Integrate your preferred charting library (TradingView, Chart.js, D3.js)
- Use the ticker subscription callback to update chart data in real-time

### Order Book
- Real-time updates will automatically populate the order book display
- Customize the number of price levels shown

## Authentication (Required for Trading)

For order placement and position data, you'll need to implement authentication:

1. **API Keys**: Store securely (use environment variables in production)
2. **WebSocket Authentication**: Send auth message after connection
3. **Order Placement**: Implement order placement API calls
4. **Position Updates**: Subscribe to authenticated position channels

## Error Handling

The WebSocket service includes:
- Automatic reconnection with exponential backoff
- Error logging and recovery
- Memory leak prevention through proper cleanup
- Connection state monitoring

## Testing Your Integration

1. **Connection Status**: Check `connectionStatus` in TradingContext
2. **Console Logs**: All WebSocket messages are logged for debugging
3. **Data Verification**: Check if `marketData`, `orderBooks` objects are populated
4. **Subscription Tracking**: Monitor active subscriptions in browser dev tools

## Performance Considerations

- **Selective Subscriptions**: Only subscribe to symbols you're actively displaying
- **Data Throttling**: Consider throttling high-frequency updates for UI performance
- **Memory Management**: The service automatically cleans up inactive subscriptions
- **Batch Updates**: Group multiple symbol updates for efficient React re-renders

## Next Steps

1. Test WebSocket connection with Delta Exchange
2. Verify data format matches expected structure
3. Implement data parsing and state updates
4. Add authentication for trading features
5. Integrate charting library of choice
6. Add error handling and user feedback
7. Implement order placement functionality

## Common Issues

- **CORS**: May need to handle CORS for direct browser connections
- **Rate Limits**: Be aware of Delta Exchange rate limiting
- **Authentication**: Required for private data (positions, orders, balances)
- **Data Format**: Verify actual Delta Exchange response format matches expectations

---

**Ready for Integration**: The codebase is now clean, documented, and ready for your Python backend integration. All WebSocket handling is abstracted and scalable.
