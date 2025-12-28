import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StreamManager } from '../services/stream-manager.js';
import { WebSocket } from 'ws';

// Mock WebSocket
function createMockSocket(): WebSocket {
  const handlers: Record<string, (data: unknown) => void> = {};
  return {
    readyState: WebSocket.OPEN,
    send: vi.fn(),
    on: vi.fn((event: string, handler: (data: unknown) => void) => {
      handlers[event] = handler;
    }),
    close: vi.fn(),
    // Helper to trigger events in tests
    _trigger: (event: string, data?: unknown) => {
      if (handlers[event]) handlers[event](data);
    },
  } as unknown as WebSocket & { _trigger: (event: string, data?: unknown) => void };
}

describe('StreamManager', () => {
  let manager: StreamManager;

  beforeEach(() => {
    manager = new StreamManager();
  });

  describe('addConnection', () => {
    it('adds a connection', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);

      expect(manager.getConnectionCount()).toBe(1);
    });

    it('handles multiple connections', () => {
      manager.addConnection('conn-1', createMockSocket());
      manager.addConnection('conn-2', createMockSocket());
      manager.addConnection('conn-3', createMockSocket());

      expect(manager.getConnectionCount()).toBe(3);
    });
  });

  describe('removeConnection', () => {
    it('removes a connection', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.removeConnection('conn-1');

      expect(manager.getConnectionCount()).toBe(0);
    });

    it('cleans up task subscriptions on remove', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      expect(manager.getTaskSubscriberCount('task-1')).toBe(1);

      manager.removeConnection('conn-1');

      expect(manager.getTaskSubscriberCount('task-1')).toBe(0);
    });
  });

  describe('subscribeToTask', () => {
    it('subscribes connection to task', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      expect(manager.getTaskSubscriberCount('task-1')).toBe(1);
    });

    it('sends confirmation message', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'subscribed', taskId: 'task-1' })
      );
    });

    it('allows multiple connections to same task', () => {
      manager.addConnection('conn-1', createMockSocket());
      manager.addConnection('conn-2', createMockSocket());

      manager.subscribeToTask('conn-1', 'task-1');
      manager.subscribeToTask('conn-2', 'task-1');

      expect(manager.getTaskSubscriberCount('task-1')).toBe(2);
    });
  });

  describe('emit', () => {
    it('sends event to task subscribers', () => {
      const socket1 = createMockSocket();
      const socket2 = createMockSocket();

      manager.addConnection('conn-1', socket1);
      manager.addConnection('conn-2', socket2);

      manager.subscribeToTask('conn-1', 'task-1');
      manager.subscribeToTask('conn-2', 'task-1');

      manager.emitOutput('task-1', 'Hello, world!');

      // Both sockets should receive the event
      expect(socket1.send).toHaveBeenCalledTimes(2); // 1 for subscribe, 1 for emit
      expect(socket2.send).toHaveBeenCalledTimes(2);
    });

    it('does not send to non-subscribers', () => {
      const socket1 = createMockSocket();
      const socket2 = createMockSocket();

      manager.addConnection('conn-1', socket1);
      manager.addConnection('conn-2', socket2);

      manager.subscribeToTask('conn-1', 'task-1');
      // conn-2 not subscribed

      manager.emitOutput('task-1', 'Hello!');

      expect(socket1.send).toHaveBeenCalledTimes(2); // subscribe + emit
      expect(socket2.send).toHaveBeenCalledTimes(0); // nothing
    });
  });

  describe('emitTaskStarted', () => {
    it('emits task_started event with correct structure', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      manager.emitTaskStarted('task-1', 'Starting task...');

      const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = JSON.parse(calls[calls.length - 1][0]);

      expect(lastCall.type).toBe('task_started');
      expect(lastCall.taskId).toBe('task-1');
      expect(lastCall.data.message).toBe('Starting task...');
      expect(lastCall.timestamp).toBeDefined();
    });
  });

  describe('emitFileEdit', () => {
    it('emits file_edit event', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      manager.emitFileEdit('task-1', 'src/app.ts', 'edit', 25);

      const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = JSON.parse(calls[calls.length - 1][0]);

      expect(lastCall.type).toBe('file_edit');
      expect(lastCall.data.path).toBe('src/app.ts');
      expect(lastCall.data.action).toBe('edit');
      expect(lastCall.data.linesChanged).toBe(25);
    });
  });

  describe('emitTaskCompleted', () => {
    it('emits task_completed event with PR URL', () => {
      const socket = createMockSocket();
      manager.addConnection('conn-1', socket);
      manager.subscribeToTask('conn-1', 'task-1');

      manager.emitTaskCompleted(
        'task-1',
        true,
        'Task completed successfully',
        'https://github.com/user/repo/pull/123'
      );

      const calls = (socket.send as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = JSON.parse(calls[calls.length - 1][0]);

      expect(lastCall.type).toBe('task_completed');
      expect(lastCall.data.success).toBe(true);
      expect(lastCall.data.summary).toBe('Task completed successfully');
      expect(lastCall.data.prUrl).toBe('https://github.com/user/repo/pull/123');
    });
  });
});
