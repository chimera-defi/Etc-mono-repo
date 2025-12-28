import { z } from 'zod';

// Task status
export const TaskStatus = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Task schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  task: z.string().min(1),
  repoUrl: z.string().url().optional(),
  repoPath: z.string().optional(),
  status: TaskStatus,
  output: z.string().optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// Create task request
export const CreateTaskSchema = z.object({
  task: z.string().min(1, 'Task description is required'),
  repoUrl: z.string().url().optional(),
  repoPath: z.string().optional(),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;

// VPS connection
export const VPSConnectionSchema = z.object({
  endpoint: z.string().url(),
  apiKey: z.string().min(1),
});
export type VPSConnection = z.infer<typeof VPSConnectionSchema>;

// Voice transcription request
export const TranscribeRequestSchema = z.object({
  audio: z.string(), // base64 encoded audio
  format: z.enum(['m4a', 'mp3', 'wav', 'webm']).default('m4a'),
});
export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>;

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

// =============================================================================
// STREAMING EVENTS (WebSocket)
// =============================================================================

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

// =============================================================================
// TEXT INPUT (alongside voice)
// =============================================================================

export const TextInputSchema = z.object({
  text: z.string().min(1, 'Text input is required'),
  repoUrl: z.string().url().optional(),
  repoPath: z.string().optional(),
});
export type TextInputRequest = z.infer<typeof TextInputSchema>;

// =============================================================================
// GIT WORKFLOW
// =============================================================================

export const GitConfigSchema = z.object({
  repoUrl: z.string().url(),
  branch: z.string().optional(),
  baseBranch: z.string().default('main'),
  autoCommit: z.boolean().default(true),
  autoPR: z.boolean().default(true),
  prTitle: z.string().optional(),
  prBody: z.string().optional(),
});
export type GitConfig = z.infer<typeof GitConfigSchema>;

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: number;
}

export interface PullRequest {
  number: number;
  url: string;
  title: string;
  state: 'open' | 'closed' | 'merged';
  branch: string;
  baseBranch: string;
  commits: GitCommit[];
  createdAt: string;
  mergedAt?: string;
}

// GitHub Webhook Events
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
