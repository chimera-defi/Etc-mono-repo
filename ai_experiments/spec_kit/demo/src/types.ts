/**
 * Type definitions for the Task Planner demo
 * These match the schema defined in specs/task-planner.md
 */

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  /** Unique task identifier (pattern: TASK-N) */
  id: string;
  /** Short task title (max 100 chars) */
  title: string;
  /** Detailed task description (max 500 chars) */
  description: string;
  /** Task priority level */
  priority: Priority;
  /** Estimated hours to complete (0.5 - 40) */
  estimated_hours: number;
  /** IDs of tasks this depends on */
  dependencies?: string[];
  /** Optional categorization tags */
  tags?: string[];
}

export interface TaskPlanResponse {
  /** Brief summary of the project (max 500 chars) */
  project_summary: string;
  /** List of tasks (1-10 items) */
  tasks: Task[];
  /** Sum of all task hours */
  total_estimated_hours: number;
}

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface PlannerOptions {
  /** Maximum number of validation retries */
  maxRetries?: number;
  /** Whether to log validation details */
  verbose?: boolean;
}
