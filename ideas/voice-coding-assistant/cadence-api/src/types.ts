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
