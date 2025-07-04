
/**
 * Delta Exchange WebSocket Service
 * 
 * This service provides fine-grained control over WebSocket subscriptions.
 * Each subscription is identified by a unique combination of channel + symbol,
 * allowing independent listening to different symbols on the same channel.
 * 
 * Usage Examples:
 * 1. Subscribe to ticker for specific symbols:
 *    wsService.subscribe('v2/ticker', 'BTCUSDT', (data) => console.log(data));
 *    wsService.subscribe('v2/ticker', 'ETHUSDT', (data) => console.log(data));
 * 
 * 2. Subscribe to orderbook for a symbol:
 *    wsService.subscribe('l2_orderbook', 'BTCUSDT', (data) => console.log(data));
 * 
 * 3. Subscribe to trades for a symbol:
 *    wsService.subscribe('l1_tradebook', 'BTCUSDT', (data) => console.log(data));
 */

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface DeltaMessage {
  type: string;
  table?: string;
  action?: string;
  data?: any[];
}

export interface SubscriptionKey {
  channel: string;
  symbol?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Map of unique subscription keys to callback sets
  // Key format: "channel:symbol" or just "channel" for global subscriptions
  private subscribers = new Map<string, Set<(data: any) => void>>();
  
  // Track active subscriptions to Delta Exchange
  private activeSubscriptions = new Set<string>();
  
  private isConnecting = false;
  private isDestroyed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  /**
   * Connect to Delta Exchange WebSocket
   */
  connect(): Promise<void> {
    if (this.isDestroyed) return Promise.reject(new Error('Service destroyed'));
    if (this.isConnecting) return Promise.resolve();
    
    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to Delta Exchange');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Re-subscribe to all active subscriptions after reconnection
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: DeltaMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          if (!this.isDestroyed && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Subscribe to a specific channel + symbol combination
   * 
   * @param channel - Delta Exchange channel (e.g., 'v2/ticker', 'l2_orderbook', 'l1_tradebook')
   * @param symbol - Trading symbol (e.g., 'BTCUSDT') - optional for global channels
   * @param callback - Function to call when data is received
   * @returns Unsubscribe function
   */
  subscribe(channel: string, symbol: string | null, callback: (data: any) => void): () => void {
    const subscriptionKey = this.createSubscriptionKey(channel, symbol);
    
    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set());
      
      // Send subscription to Delta Exchange if this is the first subscriber for this channel+symbol
      this.sendSubscription(channel, symbol);
    }
    
    this.subscribers.get(subscriptionKey)!.add(callback);
    
    console.log(`Subscribed to ${subscriptionKey}`);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(subscriptionKey);
      if (subscribers) {
        subscribers.delete(callback);
        
        // If no more subscribers for this channel+symbol, unsubscribe from Delta
        if (subscribers.size === 0) {
          this.subscribers.delete(subscriptionKey);
          this.sendUnsubscription(channel, symbol);
          console.log(`Unsubscribed from ${subscriptionKey}`);
        }
      }
    };
  }

  /**
   * Handle incoming messages from Delta Exchange
   */
  private handleMessage(message: DeltaMessage) {
    if (message.type === 'table' && message.table && message.data) {
      // Delta sends data in table format
      const channel = message.table;
      
      message.data.forEach((item: any) => {
        const symbol = item.symbol || null;
        const subscriptionKey = this.createSubscriptionKey(channel, symbol);
        
        const subscribers = this.subscribers.get(subscriptionKey);
        if (subscribers) {
          subscribers.forEach(callback => {
            try {
              callback({
                channel,
                symbol,
                action: message.action,
                data: item
              });
            } catch (error) {
              console.error('Error in subscriber callback:', error);
            }
          });
        }
      });
    }
  }

  /**
   * Send subscription message to Delta Exchange
   */
  private sendSubscription(channel: string, symbol: string | null) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        payload: {
          channels: [{ 
            name: symbol ? `${channel}:${symbol}` : channel 
          }]
        }
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      
      const subscriptionKey = this.createSubscriptionKey(channel, symbol);
      this.activeSubscriptions.add(subscriptionKey);
      
      console.log(`Sent subscription: ${subscriptionKey}`);
    }
  }

  /**
   * Send unsubscription message to Delta Exchange
   */
  private sendUnsubscription(channel: string, symbol: string | null) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        type: 'unsubscribe',
        payload: {
          channels: [{ 
            name: symbol ? `${channel}:${symbol}` : channel 
          }]
        }
      };
      
      this.ws.send(JSON.stringify(unsubscribeMessage));
      
      const subscriptionKey = this.createSubscriptionKey(channel, symbol);
      this.activeSubscriptions.delete(subscriptionKey);
      
      console.log(`Sent unsubscription: ${subscriptionKey}`);
    }
  }

  /**
   * Create a unique subscription key for channel + symbol combination
   */
  private createSubscriptionKey(channel: string, symbol: string | null): string {
    return symbol ? `${channel}:${symbol}` : channel;
  }

  /**
   * Re-subscribe to all active subscriptions (used after reconnection)
   */
  private resubscribeAll() {
    this.activeSubscriptions.forEach(subscriptionKey => {
      const [channel, symbol] = subscriptionKey.includes(':') 
        ? subscriptionKey.split(':') 
        : [subscriptionKey, null];
      
      this.sendSubscription(channel, symbol);
    });
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < (this.config.maxReconnectAttempts || 10);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
      this.connect().catch(console.error);
    }, this.config.reconnectInterval);
  }

  /**
   * Send raw message to Delta Exchange
   */
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send data');
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.isDestroyed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscribers.clear();
    this.activeSubscriptions.clear();
  }
}
