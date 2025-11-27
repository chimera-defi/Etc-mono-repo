/**
 * Type definitions for Task Planner
 * 
 * B-MAD Method - Developer Agent Output
 * Based on PRD specifications
 */

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  /** Unique identifier (pattern: TASK-N) */
  id: string;
  /** Short task title (max 100 chars) */
  title: string;
  /** Detailed description (max 500 chars) */
  description: string;
  /** Priority level */
  priority: Priority;
  /** Estimated hours (0.5-40) */
  estimated_hours: number;
  /** Dependent task IDs */
  dependencies?: string[];
  /** Categorization tags */
  tags?: string[];
}

export interface TaskPlan {
  /** Brief project summary (max 500 chars) */
  project_summary: string;
  /** List of tasks (1-10 items) */
  tasks: Task[];
  /** Sum of all estimates */
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

export interface PlannerConfig {
  maxRetries: number;
  verbose: boolean;
}

export const DEFAULT_CONFIG: PlannerConfig = {
  maxRetries: 3,
  verbose: false,
};
