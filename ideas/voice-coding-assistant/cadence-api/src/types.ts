import { z } from 'zod';

// Task status (extended with PR states)
export const TaskStatus = z.enum([
  'pending',      // Task created, not started
  'running',      // Agent executing, no PR yet
  'pr_open',      // PR created, awaiting review/merge
  'completed',    // PR merged successfully
  'failed',       // Agent error
  'cancelled'     // PR closed without merge, or user cancelled
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// PR state
export const PRState = z.enum(['open', 'merged', 'closed']);
export type PRState = z.infer<typeof PRState>;

// Task schema (extended with PR lifecycle fields)
export const TaskSchema = z.object({
  id: z.string().uuid(),
  task: z.string().min(1),
  repoUrl: z.string().url().optional(),
  repoPath: z.string().optional(),
  status: TaskStatus,
  output: z.string().optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  // PR Lifecycle Fields
  prUrl: z.string().url().optional(),
  prNumber: z.number().int().positive().optional(),
  prState: PRState.optional(),
  prBranch: z.string().optional(),
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

// =============================================================================
// GITHUB OAUTH & REPOS
// =============================================================================

// GitHub user (from OAuth)
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

// GitHub repository
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
}

// Session with GitHub auth
export interface Session {
  githubToken?: string;
  user?: GitHubUser;
}
