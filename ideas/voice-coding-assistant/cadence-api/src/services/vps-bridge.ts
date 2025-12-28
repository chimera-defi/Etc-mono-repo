import { Task } from '../types.js';

interface TaskResult {
  success: boolean;
  output: string;
}

/**
 * Bridge to user's VPS running Claude Code.
 * Communicates with the cadence-bridge server on the VPS.
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
   * Execute a task on the VPS via Claude Code
   */
  async executeTask(task: Task): Promise<TaskResult> {
    if (!this.endpoint || !this.apiKey) {
      // Mock execution for development/testing
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
        signal: AbortSignal.timeout(300000), // 5 minute timeout
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          output: `VPS error: ${error}`,
        };
      }

      const result = await response.json() as TaskResult;
      return result;
    } catch (error) {
      return {
        success: false,
        output: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Mock execution for testing without a VPS
   */
  private async mockExecution(task: Task): Promise<TaskResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      output: `[MOCK] Executed task: "${task.task}"\n\nThis is a mock response. Configure VPS_ENDPOINT and VPS_API_KEY for real execution.`,
    };
  }
}
