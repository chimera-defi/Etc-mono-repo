import { Task } from '../types.js';

interface TaskResult {
  success: boolean;
  output: string;
  prUrl?: string;
}

interface StreamingEvent {
  type: 'tool_use' | 'file_edit' | 'command_run' | 'output' | 'error';
  tool?: string;
  input?: Record<string, unknown>;
  path?: string;
  action?: 'create' | 'edit' | 'delete';
  linesChanged?: number;
  command?: string;
  exitCode?: number;
  output?: string;
  text?: string;
  message?: string;
  recoverable?: boolean;
}

type StreamCallback = (event: StreamingEvent) => void;

/**
 * Bridge to user's VPS running Claude Code.
 * Communicates with the cadence-bridge server on the VPS.
 * Supports both blocking and streaming execution.
 */
export class VPSBridge {
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = process.env.VPS_ENDPOINT || '';
    this.apiKey = process.env.VPS_API_KEY || '';
  }

  /**
   * Configure the VPS connection
   */
  configure(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  /**
   * Check if VPS is connected and healthy
   */
  async healthCheck(): Promise<boolean> {
    if (!this.endpoint) {
      return false;
    }

    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Execute a task on the VPS via Claude Code (blocking)
   */
  async executeTask(task: Task): Promise<TaskResult> {
    if (!this.endpoint || !this.apiKey) {
      return this.mockExecution(task);
    }

    try {
      const response = await fetch(`${this.endpoint}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          task: task.task,
          repoUrl: task.repoUrl,
          repoPath: task.repoPath,
        }),
        signal: AbortSignal.timeout(300000),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, output: `VPS error: ${error}` };
      }

      return await response.json() as TaskResult;
    } catch (error) {
      return {
        success: false,
        output: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Execute a task with streaming callbacks
   * The VPS sends Server-Sent Events, which we parse and forward
   */
  async executeTaskStreaming(
    task: Task,
    onEvent: StreamCallback
  ): Promise<TaskResult> {
    if (!this.endpoint || !this.apiKey) {
      return this.mockExecutionStreaming(task, onEvent);
    }

    try {
      const response = await fetch(`${this.endpoint}/task/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          task: task.task,
          repoUrl: task.repoUrl,
          repoPath: task.repoPath,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, output: `VPS error: ${error}` };
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        return { success: false, output: 'No response body' };
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let result: TaskResult = { success: false, output: '' };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'complete') {
                result = {
                  success: event.success,
                  output: event.output,
                  prUrl: event.prUrl,
                };
              } else {
                onEvent(event as StreamingEvent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        output: `Stream error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Mock execution for testing without a VPS (blocking)
   */
  private async mockExecution(task: Task): Promise<TaskResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      output: `[MOCK] Executed task: "${task.task}"\n\nThis is a mock response. Configure VPS_ENDPOINT and VPS_API_KEY for real execution.`,
    };
  }

  /**
   * Mock execution with streaming for testing
   */
  private async mockExecutionStreaming(
    task: Task,
    onEvent: StreamCallback
  ): Promise<TaskResult> {
    // Simulate a realistic execution flow
    const events: StreamingEvent[] = [
      { type: 'output', text: `Starting task: ${task.task}` },
      { type: 'tool_use', tool: 'Read', input: { path: 'package.json' } },
      { type: 'output', text: 'Analyzing codebase...' },
      { type: 'file_edit', path: 'src/example.ts', action: 'edit', linesChanged: 15 },
      { type: 'command_run', command: 'npm test', exitCode: 0, output: 'All tests passed' },
      { type: 'output', text: 'Task completed successfully!' },
    ];

    for (const event of events) {
      await new Promise(resolve => setTimeout(resolve, 500));
      onEvent(event);
    }

    return {
      success: true,
      output: `[MOCK] Executed task: "${task.task}"\n\nThis is a mock response with streaming. Configure VPS_ENDPOINT and VPS_API_KEY for real execution.`,
    };
  }
}
