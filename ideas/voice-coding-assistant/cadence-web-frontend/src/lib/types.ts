// Task status
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Task model
export interface Task {
  id: string;
  task: string;
  repoUrl?: string;
  repoPath?: string;
  status: TaskStatus;
  output?: string;
  createdAt: string;
  completedAt?: string;
}

// Create task request
export interface CreateTaskRequest {
  task: string;
  repoUrl?: string;
  repoPath?: string;
}

// VPS connection
export interface VPSConnection {
  endpoint: string;
  apiKey: string;
}

// Voice transcription request
export interface TranscribeRequest {
  audio: string; // base64 encoded audio
  format: 'm4a' | 'mp3' | 'wav' | 'webm';
}

// Voice transcription response
export interface TranscribeResponse {
  text: string;
  duration: number;
}

// Command parsing result
export interface ParsedCommand {
  intent: 'create_task' | 'check_status' | 'cancel_task' | 'list_tasks' | 'unknown';
  task?: string;
  repoUrl?: string;
  confidence: number;
}

// Streaming events (WebSocket)
export type StreamEventType =
  | 'task_started'
  | 'tool_use'
  | 'file_edit'
  | 'command_run'
  | 'output'
  | 'error'
  | 'task_completed';

export interface StreamEvent {
  type: StreamEventType;
  taskId: string;
  timestamp: string;
  data: StreamEventData;
}

export type StreamEventData =
  | { type: 'task_started'; message: string }
  | { type: 'tool_use'; tool: string; input: Record<string, unknown> }
  | { type: 'file_edit'; path: string; action: 'create' | 'edit' | 'delete'; linesChanged?: number }
  | { type: 'command_run'; command: string; exitCode?: number; output?: string }
  | { type: 'output'; text: string }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'task_completed'; success: boolean; summary: string; prUrl?: string };

// Text input request
export interface TextInputRequest {
  text: string;
  repoUrl?: string;
  repoPath?: string;
}

// GitHub webhook payload (for display)
export interface GitHubWebhookPayload {
  action: string;
  repository: {
    full_name: string;
    html_url: string;
  };
  pull_request?: {
    number: number;
    html_url: string;
    title: string;
    state: string;
    merged: boolean;
    head: { ref: string };
    base: { ref: string };
  };
  issue?: {
    number: number;
    title: string;
    body: string;
  };
  comment?: {
    body: string;
    user: { login: string };
  };
}

// App settings
export interface Settings {
  endpoint: string;
  apiKey: string;
  openaiKey: string;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  darkMode: boolean;
}

// API response types
export interface TaskListResponse {
  tasks: Task[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
