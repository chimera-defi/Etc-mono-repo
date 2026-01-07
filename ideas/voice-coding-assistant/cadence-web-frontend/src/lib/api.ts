import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  TranscribeResponse,
  ParsedCommand,
  HealthResponse,
} from './types';

class APIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = 'http://localhost:3001', apiKey: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  setConfig(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async health(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/api/health');
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await this.fetch<TaskListResponse>('/api/tasks');
    return response.tasks;
  }

  async getTask(id: string): Promise<Task> {
    return this.fetch<Task>(`/api/tasks/${id}`);
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    return this.fetch<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async cancelTask(id: string): Promise<{ success: boolean; task: Task }> {
    return this.fetch<{ success: boolean; task: Task }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Voice
  async transcribe(audioBase64: string, format: string = 'webm'): Promise<TranscribeResponse> {
    return this.fetch<TranscribeResponse>('/api/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audio: audioBase64, format }),
    });
  }

  async parseCommand(text: string): Promise<ParsedCommand> {
    return this.fetch<ParsedCommand>('/api/voice/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async voiceCommand(
    audioBase64: string,
    format: string = 'webm'
  ): Promise<{ transcript: string; command: ParsedCommand }> {
    return this.fetch<{ transcript: string; command: ParsedCommand }>(
      '/api/voice/command',
      {
        method: 'POST',
        body: JSON.stringify({ audio: audioBase64, format }),
      }
    );
  }

  // Text input (alternative to voice)
  async textInput(
    text: string,
    repoUrl?: string
  ): Promise<{ command: ParsedCommand; task?: Task }> {
    return this.fetch<{ command: ParsedCommand; task?: Task }>('/api/input/text', {
      method: 'POST',
      body: JSON.stringify({ text, repoUrl }),
    });
  }

  // WebSocket URL
  getWebSocketUrl(): string {
    const wsProtocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = this.baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${host}/api/ws/stream`;
  }
}

// Singleton instance
export const api = new APIClient();

// Initialize from localStorage on client side
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('cadence-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.settings) {
        api.setConfig(state.settings.endpoint, state.settings.apiKey);
      }
    } catch {
      // Ignore parse errors
    }
  }
}
