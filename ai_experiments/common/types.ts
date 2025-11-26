/**
 * Shared TypeScript types for spec-driven development tool comparison
 */

// ============================================
// Task Planner Types
// ============================================

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  /** Unique task identifier (e.g., "TASK-1") */
  id?: string;
  /** Short task title */
  title: string;
  /** Detailed task description */
  description: string;
  /** Task priority level */
  priority: Priority;
  /** Estimated hours to complete */
  estimated_hours: number;
  /** IDs of tasks this depends on */
  dependencies?: string[];
  /** Optional tags for categorization */
  tags?: string[];
}

export interface TaskPlannerResponse {
  /** Brief summary of the project */
  project_summary: string;
  /** List of tasks to complete the project */
  tasks: Task[];
  /** Sum of all task estimated hours */
  total_estimated_hours?: number;
  /** Metadata about the generation */
  metadata?: {
    generated_at?: string;
    tool?: 'spec_kit' | 'bmad' | 'none';
  };
}

// ============================================
// Test Scenario Types
// ============================================

export interface TestScenario {
  id: string;
  name: string;
  input: string;
  expected_task_count_range?: [number, number];
  expected_fields?: string[];
  constraint?: string;
  expected_behavior?: string;
}

export interface TestPrompts {
  version: string;
  description: string;
  demo_app: string;
  scenarios: {
    happy_path: TestScenario[];
    constraint_enforcement: TestScenario[];
    edge_cases: TestScenario[];
  };
  metadata: {
    created: string;
    purpose: string;
    stack: string;
  };
}

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

// ============================================
// Benchmark Types
// ============================================

export interface BenchmarkResult {
  tool: 'spec_kit' | 'bmad';
  scenario_id: string;
  scenario_name: string;
  success: boolean;
  latency_ms: number;
  retries: number;
  validation_passed: boolean;
  error?: string;
  response?: TaskPlannerResponse;
}

export interface AggregateMetrics {
  tool: 'spec_kit' | 'bmad';
  total_scenarios: number;
  success_count: number;
  success_rate: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  avg_retries: number;
  validation_pass_rate: number;
}
