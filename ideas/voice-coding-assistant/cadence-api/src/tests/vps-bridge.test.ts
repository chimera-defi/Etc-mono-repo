import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VPSBridge } from '../services/vps-bridge.js';
import { Task } from '../types.js';

describe('VPSBridge', () => {
  let bridge: VPSBridge;

  beforeEach(() => {
    bridge = new VPSBridge();
  });

  describe('healthCheck', () => {
    it('returns false when no endpoint configured', async () => {
      const result = await bridge.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('executeTask (mock mode)', () => {
    it('returns mock response when no VPS configured', async () => {
      const task: Task = {
        id: 'test-id',
        task: 'Add a button',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const result = await bridge.executeTask(task);

      expect(result.success).toBe(true);
      expect(result.output).toContain('[MOCK]');
      expect(result.output).toContain('Add a button');
    });
  });

  describe('executeTaskStreaming (mock mode)', () => {
    it('returns mock response with streaming events', async () => {
      const task: Task = {
        id: 'test-id',
        task: 'Fix the bug',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const events: Array<{ type: string }> = [];
      const onEvent = vi.fn((event: { type: string }) => events.push(event));

      const result = await bridge.executeTaskStreaming(task, onEvent);

      expect(result.success).toBe(true);
      expect(result.output).toContain('[MOCK]');

      // Should have received streaming events
      expect(onEvent).toHaveBeenCalled();
      expect(events.length).toBeGreaterThan(0);

      // Check event types
      const eventTypes = events.map((e) => e.type);
      expect(eventTypes).toContain('output');
      expect(eventTypes).toContain('tool_use');
      expect(eventTypes).toContain('file_edit');
      expect(eventTypes).toContain('command_run');
    });

    it('simulates realistic execution flow', async () => {
      const task: Task = {
        id: 'test-id',
        task: 'Test task',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const events: { type: string }[] = [];
      const onEvent = vi.fn((event) => events.push(event));

      await bridge.executeTaskStreaming(task, onEvent);

      // Verify order of events makes sense
      const firstEvent = events[0];
      expect(firstEvent.type).toBe('output'); // Should start with output

      // Should include file operations
      const hasFileEdit = events.some((e) => e.type === 'file_edit');
      expect(hasFileEdit).toBe(true);

      // Should run tests
      const hasCommandRun = events.some((e) => e.type === 'command_run');
      expect(hasCommandRun).toBe(true);
    });
  });
});
