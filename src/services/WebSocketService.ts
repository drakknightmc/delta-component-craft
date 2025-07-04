
export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface DeltaTickerData {
  symbol: string;
  price: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  timestamp: number;
  change: string;
  product_id: number;
}

export interface DeltaOrderBookData {
  symbol: string;
  product_id: number;
  buy: Array<{ price: string; size: string }>;
  sell: Array<{ price: string; size: string }>;
  last_sequence_no: number;
  last_updated_at: number;
}

export interface DeltaTradeData {
  symbol: string;
  price: string;
  size: string;
  side: 'buy' | 'sell';
  timestamp: number;
  buyer_role: string;
  seller_role: string;
}

export interface DeltaMessage {
  type: string;
  table?: string;
  action?: string;
  data?: any[];
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private isConnecting = false;
  private isDestroyed = false;
  private subscribedChannels = new Set<string>();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

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
          
          // Re-subscribe to channels after reconnection
          this.resubscribeChannels();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: DeltaMessage = JSON.parse(event.data);
            this.handleDeltaMessage(message);
          } catch (error) {
            console.error('Error parsing Delta WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('Delta WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          if (!this.isDestroyed && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('Delta WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleDeltaMessage(message: DeltaMessage) {
    console.log('Received Delta message:', message);
    
    if (message.type === 'table' && message.table && message.data) {
      const subscribers = this.subscribers.get(message.table);
      
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback({
              action: message.action,
              data: message.data
            });
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      }
    }
  }

  private resubscribeChannels() {
    this.subscribedChannels.forEach(channel => {
      this.subscribeToChannel(channel);
    });
  }

  subscribeToChannel(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        payload: {
          channels: [{ name: channel }]
        }
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      this.subscribedChannels.add(channel);
      console.log(`Subscribed to Delta channel: ${channel}`);
    } else {
      console.warn('WebSocket not connected, cannot subscribe to channel:', channel);
    }
  }

  unsubscribeFromChannel(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        type: 'unsubscribe',
        payload: {
          channels: [{ name: channel }]
        }
      };
      
      this.ws.send(JSON.stringify(unsubscribeMessage));
      this.subscribedChannels.delete(channel);
      console.log(`Unsubscribed from Delta channel: ${channel}`);
    }
  }

  subscribe(table: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(table)) {
      this.subscribers.set(table, new Set());
    }
    
    this.subscribers.get(table)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(table);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(table);
        }
      }
    };
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send data');
    }
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
      console.log(`Attempting to reconnect to Delta... (${this.reconnectAttempts})`);
      this.connect().catch(console.error);
    }, this.config.reconnectInterval);
  }

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
    this.subscribedChannels.clear();
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}
