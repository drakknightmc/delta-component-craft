
export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  timestamp: number;
}

export interface OrderBookData {
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  symbol: string;
}

export interface PositionData {
  symbol: string;
  size: number;
  avgPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private isConnecting = false;
  private isDestroyed = false;

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
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
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

  private handleMessage(data: any) {
    const { type, payload } = data;
    const subscribers = this.subscribers.get(type);
    
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    
    this.subscribers.get(type)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(type);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(type);
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
      console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
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
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}
