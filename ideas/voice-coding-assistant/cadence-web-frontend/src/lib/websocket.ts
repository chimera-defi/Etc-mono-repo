import type { StreamEvent } from './types';

type EventHandler = (event: StreamEvent) => void;
type ConnectionHandler = () => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: EventHandler[] = [];
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];
  private subscribedTaskIds: Set<string> = new Set();

  connect(url: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.url = url;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach((handler) => handler());

      // Re-subscribe to tasks
      this.subscribedTaskIds.forEach((taskId) => {
        this.subscribe(taskId);
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle welcome message
        if (data.type === 'connected') {
          console.log('[WebSocket] Received welcome:', data.message);
          return;
        }

        // Handle stream events
        this.eventHandlers.forEach((handler) => handler(data as StreamEvent));
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.disconnectHandlers.forEach((handler) => handler());

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(this.url), delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedTaskIds.clear();
  }

  subscribe(taskId: string): void {
    this.subscribedTaskIds.add(taskId);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', taskId }));
    }
  }

  unsubscribe(taskId: string): void {
    this.subscribedTaskIds.delete(taskId);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', taskId }));
    }
  }

  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.push(handler);
    return () => {
      this.connectHandlers = this.connectHandlers.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter((h) => h !== handler);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
