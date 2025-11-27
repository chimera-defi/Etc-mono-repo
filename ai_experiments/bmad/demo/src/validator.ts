/**
 * Validator for Task Plans
 * 
 * B-MAD Method - Developer Agent Output
 * Implements validation rules from PRD section 4.3
 */

import type { ValidationError, ValidationResult } from './types.js';

// Constraints from PRD
const CONSTRAINTS = {
  maxTasks: 10,
  minTasks: 1,
  minHours: 0.5,
  maxHours: 40,
  maxSummaryLength: 500,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
  taskIdPattern: /^TASK-\d+$/,
  validPriorities: ['high', 'medium', 'low'] as const,
};

/**
 * Validate a task plan against PRD requirements
 */
export function validateTaskPlan(plan: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof plan !== 'object' || plan === null) {
    return { valid: false, errors: [{ path: '', message: 'Plan must be an object' }] };
  }

  const p = plan as Record<string, unknown>;

  // Validate project_summary
  if (typeof p.project_summary !== 'string') {
    errors.push({ path: 'project_summary', message: 'Must be a string' });
  } else if (p.project_summary.length > CONSTRAINTS.maxSummaryLength) {
    errors.push({ 
      path: 'project_summary', 
      message: `Max ${CONSTRAINTS.maxSummaryLength} characters`,
      value: p.project_summary.length 
    });
  }

  // Validate tasks array
  if (!Array.isArray(p.tasks)) {
    errors.push({ path: 'tasks', message: 'Must be an array' });
  } else {
    if (p.tasks.length < CONSTRAINTS.minTasks) {
      errors.push({ path: 'tasks', message: `Minimum ${CONSTRAINTS.minTasks} task(s)` });
    }
    if (p.tasks.length > CONSTRAINTS.maxTasks) {
      errors.push({ path: 'tasks', message: `Maximum ${CONSTRAINTS.maxTasks} tasks` });
    }

    const taskIds = new Set<string>();
    p.tasks.forEach((task, i) => {
      validateTask(task, i, taskIds, errors);
      if (task && typeof task === 'object' && 'id' in task) {
        taskIds.add((task as { id: string }).id);
      }
    });
  }

  // Validate total_estimated_hours
  if (typeof p.total_estimated_hours !== 'number') {
    errors.push({ path: 'total_estimated_hours', message: 'Must be a number' });
  } else if (p.total_estimated_hours < 0) {
    errors.push({ path: 'total_estimated_hours', message: 'Must be non-negative' });
  }

  return { valid: errors.length === 0, errors };
}

function validateTask(
  task: unknown,
  index: number,
  existingIds: Set<string>,
  errors: ValidationError[]
): void {
  const path = `tasks[${index}]`;

  if (typeof task !== 'object' || task === null) {
    errors.push({ path, message: 'Task must be an object' });
    return;
  }

  const t = task as Record<string, unknown>;

  // Validate id
  if (typeof t.id !== 'string') {
    errors.push({ path: `${path}.id`, message: 'Must be a string' });
  } else {
    if (!CONSTRAINTS.taskIdPattern.test(t.id)) {
      errors.push({ path: `${path}.id`, message: 'Must match TASK-N pattern', value: t.id });
    }
    if (existingIds.has(t.id)) {
      errors.push({ path: `${path}.id`, message: 'Must be unique', value: t.id });
    }
  }

  // Validate title
  if (typeof t.title !== 'string' || t.title.length === 0) {
    errors.push({ path: `${path}.title`, message: 'Required non-empty string' });
  } else if (t.title.length > CONSTRAINTS.maxTitleLength) {
    errors.push({ path: `${path}.title`, message: `Max ${CONSTRAINTS.maxTitleLength} chars` });
  }

  // Validate description
  if (typeof t.description !== 'string' || t.description.length === 0) {
    errors.push({ path: `${path}.description`, message: 'Required non-empty string' });
  } else if (t.description.length > CONSTRAINTS.maxDescriptionLength) {
    errors.push({ path: `${path}.description`, message: `Max ${CONSTRAINTS.maxDescriptionLength} chars` });
  }

  // Validate priority
  if (!CONSTRAINTS.validPriorities.includes(t.priority as typeof CONSTRAINTS.validPriorities[number])) {
    errors.push({ 
      path: `${path}.priority`, 
      message: `Must be: ${CONSTRAINTS.validPriorities.join(', ')}`,
      value: t.priority 
    });
  }

  // Validate estimated_hours
  if (typeof t.estimated_hours !== 'number') {
    errors.push({ path: `${path}.estimated_hours`, message: 'Must be a number' });
  } else {
    if (t.estimated_hours < CONSTRAINTS.minHours) {
      errors.push({ path: `${path}.estimated_hours`, message: `Min ${CONSTRAINTS.minHours}h` });
    }
    if (t.estimated_hours > CONSTRAINTS.maxHours) {
      errors.push({ path: `${path}.estimated_hours`, message: `Max ${CONSTRAINTS.maxHours}h` });
    }
  }

  // Validate dependencies (optional)
  if (t.dependencies !== undefined && !Array.isArray(t.dependencies)) {
    errors.push({ path: `${path}.dependencies`, message: 'Must be an array' });
  }

  // Validate tags (optional)
  if (t.tags !== undefined && !Array.isArray(t.tags)) {
    errors.push({ path: `${path}.tags`, message: 'Must be an array' });
  }
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return 'No errors';
  return errors
    .map(e => `  • ${e.path}: ${e.message}${e.value !== undefined ? ` (got: ${JSON.stringify(e.value)})` : ''}`)
    .join('\n');
}
