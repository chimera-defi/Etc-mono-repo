import { WebSocket } from 'ws';
import { StreamEvent, StreamEventType } from '../types.js';

interface Subscription {
  socket: WebSocket;
  taskIds: Set<string>;
}

/**
 * Manages WebSocket connections for real-time streaming.
 * Clients subscribe to task IDs and receive events as they happen.
 */
export class StreamManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private taskSubscribers: Map<string, Set<string>> = new Map(); // taskId -> Set<subscriptionId>

  /**
   * Register a new WebSocket connection
   */
  addConnection(id: string, socket: WebSocket): void {
    this.subscriptions.set(id, {
      socket,
      taskIds: new Set(),
    });

    socket.on('close', () => {
      this.removeConnection(id);
    });

    socket.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(id, message);
      } catch {
        // Ignore invalid messages
      }
    });
  }

  /**
   * Remove a connection and clean up subscriptions
   */
  removeConnection(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      // Remove from all task subscriber lists
      for (const taskId of subscription.taskIds) {
        const subscribers = this.taskSubscribers.get(taskId);
        if (subscribers) {
          subscribers.delete(id);
          if (subscribers.size === 0) {
            this.taskSubscribers.delete(taskId);
          }
        }
      }
      this.subscriptions.delete(id);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(id: string, message: { type: string; taskId?: string }): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    switch (message.type) {
      case 'subscribe':
        if (message.taskId) {
          this.subscribeToTask(id, message.taskId);
        }
        break;
      case 'unsubscribe':
        if (message.taskId) {
          this.unsubscribeFromTask(id, message.taskId);
        }
        break;
    }
  }

  /**
   * Subscribe a connection to a task's events
   */
  subscribeToTask(subscriptionId: string, taskId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    subscription.taskIds.add(taskId);

    if (!this.taskSubscribers.has(taskId)) {
      this.taskSubscribers.set(taskId, new Set());
    }
    this.taskSubscribers.get(taskId)!.add(subscriptionId);

    // Send confirmation
    this.sendTo(subscriptionId, {
      type: 'subscribed',
      taskId,
    });
  }

  /**
   * Unsubscribe from a task's events
   */
  unsubscribeFromTask(subscriptionId: string, taskId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    subscription.taskIds.delete(taskId);

    const subscribers = this.taskSubscribers.get(taskId);
    if (subscribers) {
      subscribers.delete(subscriptionId);
    }
  }

  /**
   * Emit an event to all subscribers of a task
   */
  emit(event: StreamEvent): void {
    const subscribers = this.taskSubscribers.get(event.taskId);
    if (!subscribers) return;

    const message = JSON.stringify(event);
    for (const subscriptionId of subscribers) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription && subscription.socket.readyState === WebSocket.OPEN) {
        subscription.socket.send(message);
      }
    }
  }

  /**
   * Helper to emit common event types
   */
  emitTaskStarted(taskId: string, message: string): void {
    this.emit({
      type: 'task_started',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'task_started', message },
    });
  }

  emitToolUse(taskId: string, tool: string, input: Record<string, unknown>): void {
    this.emit({
      type: 'tool_use',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'tool_use', tool, input },
    });
  }

  emitFileEdit(taskId: string, path: string, action: 'create' | 'edit' | 'delete', linesChanged?: number): void {
    this.emit({
      type: 'file_edit',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'file_edit', path, action, linesChanged },
    });
  }

  emitCommandRun(taskId: string, command: string, exitCode?: number, output?: string): void {
    this.emit({
      type: 'command_run',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'command_run', command, exitCode, output },
    });
  }

  emitOutput(taskId: string, text: string): void {
    this.emit({
      type: 'output',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'output', text },
    });
  }

  emitError(taskId: string, message: string, recoverable: boolean): void {
    this.emit({
      type: 'error',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'error', message, recoverable },
    });
  }

  emitTaskCompleted(taskId: string, success: boolean, summary: string, prUrl?: string): void {
    this.emit({
      type: 'task_completed',
      taskId,
      timestamp: new Date().toISOString(),
      data: { type: 'task_completed', success, summary, prUrl },
    });
  }

  /**
   * Send a message to a specific connection
   */
  private sendTo(subscriptionId: string, message: object): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription && subscription.socket.readyState === WebSocket.OPEN) {
      subscription.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Get count of active connections
   */
  getConnectionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get subscribers for a task
   */
  getTaskSubscriberCount(taskId: string): number {
    return this.taskSubscribers.get(taskId)?.size ?? 0;
  }
}

// Singleton instance
export const streamManager = new StreamManager();
