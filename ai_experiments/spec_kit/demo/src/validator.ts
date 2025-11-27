/**
 * Validator for Task Planner responses
 * Implements the constraints defined in specs/task-planner.md
 */

import type { Task, TaskPlanResponse, ValidationError, ValidationResult } from './types.js';

const TASK_ID_PATTERN = /^TASK-\d+$/;
const MAX_TASKS = 10;
const MIN_TASKS = 1;
const MIN_HOURS = 0.5;
const MAX_HOURS = 40;
const MAX_SUMMARY_LENGTH = 500;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const VALID_PRIORITIES = ['high', 'medium', 'low'] as const;

/**
 * Validate a Task Planner response against the spec
 */
export function validateTaskPlan(response: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if response is an object
  if (typeof response !== 'object' || response === null) {
    return {
      valid: false,
      errors: [{ path: '', message: 'Response must be an object', value: response }],
    };
  }

  const plan = response as Record<string, unknown>;

  // Validate project_summary
  if (typeof plan.project_summary !== 'string') {
    errors.push({
      path: 'project_summary',
      message: 'project_summary must be a string',
      value: plan.project_summary,
    });
  } else if (plan.project_summary.length > MAX_SUMMARY_LENGTH) {
    errors.push({
      path: 'project_summary',
      message: `project_summary must be at most ${MAX_SUMMARY_LENGTH} characters`,
      value: plan.project_summary.length,
    });
  }

  // Validate tasks array
  if (!Array.isArray(plan.tasks)) {
    errors.push({
      path: 'tasks',
      message: 'tasks must be an array',
      value: plan.tasks,
    });
  } else {
    // Check task count
    if (plan.tasks.length < MIN_TASKS) {
      errors.push({
        path: 'tasks',
        message: `tasks must have at least ${MIN_TASKS} item(s)`,
        value: plan.tasks.length,
      });
    }
    if (plan.tasks.length > MAX_TASKS) {
      errors.push({
        path: 'tasks',
        message: `tasks must have at most ${MAX_TASKS} items`,
        value: plan.tasks.length,
      });
    }

    // Validate each task
    const taskIds = new Set<string>();
    plan.tasks.forEach((task, index) => {
      const taskErrors = validateTask(task, index, taskIds);
      errors.push(...taskErrors);
      if (typeof task === 'object' && task !== null && 'id' in task) {
        taskIds.add((task as { id: string }).id);
      }
    });

    // Check for circular dependencies
    const circularErrors = checkCircularDependencies(plan.tasks as Task[]);
    errors.push(...circularErrors);
  }

  // Validate total_estimated_hours
  if (typeof plan.total_estimated_hours !== 'number') {
    errors.push({
      path: 'total_estimated_hours',
      message: 'total_estimated_hours must be a number',
      value: plan.total_estimated_hours,
    });
  } else if (plan.total_estimated_hours < 0) {
    errors.push({
      path: 'total_estimated_hours',
      message: 'total_estimated_hours must be non-negative',
      value: plan.total_estimated_hours,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single task
 */
function validateTask(
  task: unknown,
  index: number,
  existingIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `tasks[${index}]`;

  if (typeof task !== 'object' || task === null) {
    errors.push({
      path,
      message: 'Task must be an object',
      value: task,
    });
    return errors;
  }

  const t = task as Record<string, unknown>;

  // Validate id
  if (typeof t.id !== 'string') {
    errors.push({
      path: `${path}.id`,
      message: 'id must be a string',
      value: t.id,
    });
  } else {
    if (!TASK_ID_PATTERN.test(t.id)) {
      errors.push({
        path: `${path}.id`,
        message: 'id must match pattern TASK-N (e.g., TASK-1)',
        value: t.id,
      });
    }
    if (existingIds.has(t.id)) {
      errors.push({
        path: `${path}.id`,
        message: 'id must be unique',
        value: t.id,
      });
    }
  }

  // Validate title
  if (typeof t.title !== 'string') {
    errors.push({
      path: `${path}.title`,
      message: 'title must be a string',
      value: t.title,
    });
  } else if (t.title.length === 0) {
    errors.push({
      path: `${path}.title`,
      message: 'title must not be empty',
      value: t.title,
    });
  } else if (t.title.length > MAX_TITLE_LENGTH) {
    errors.push({
      path: `${path}.title`,
      message: `title must be at most ${MAX_TITLE_LENGTH} characters`,
      value: t.title.length,
    });
  }

  // Validate description
  if (typeof t.description !== 'string') {
    errors.push({
      path: `${path}.description`,
      message: 'description must be a string',
      value: t.description,
    });
  } else if (t.description.length === 0) {
    errors.push({
      path: `${path}.description`,
      message: 'description must not be empty',
      value: t.description,
    });
  } else if (t.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      path: `${path}.description`,
      message: `description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
      value: t.description.length,
    });
  }

  // Validate priority
  if (!VALID_PRIORITIES.includes(t.priority as typeof VALID_PRIORITIES[number])) {
    errors.push({
      path: `${path}.priority`,
      message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
      value: t.priority,
    });
  }

  // Validate estimated_hours
  if (typeof t.estimated_hours !== 'number') {
    errors.push({
      path: `${path}.estimated_hours`,
      message: 'estimated_hours must be a number',
      value: t.estimated_hours,
    });
  } else {
    if (t.estimated_hours < MIN_HOURS) {
      errors.push({
        path: `${path}.estimated_hours`,
        message: `estimated_hours must be at least ${MIN_HOURS}`,
        value: t.estimated_hours,
      });
    }
    if (t.estimated_hours > MAX_HOURS) {
      errors.push({
        path: `${path}.estimated_hours`,
        message: `estimated_hours must be at most ${MAX_HOURS}`,
        value: t.estimated_hours,
      });
    }
  }

  // Validate dependencies (optional)
  if (t.dependencies !== undefined) {
    if (!Array.isArray(t.dependencies)) {
      errors.push({
        path: `${path}.dependencies`,
        message: 'dependencies must be an array',
        value: t.dependencies,
      });
    } else {
      t.dependencies.forEach((dep, depIndex) => {
        if (typeof dep !== 'string') {
          errors.push({
            path: `${path}.dependencies[${depIndex}]`,
            message: 'dependency must be a string',
            value: dep,
          });
        } else if (!TASK_ID_PATTERN.test(dep)) {
          errors.push({
            path: `${path}.dependencies[${depIndex}]`,
            message: 'dependency must match pattern TASK-N',
            value: dep,
          });
        }
      });
    }
  }

  // Validate tags (optional)
  if (t.tags !== undefined) {
    if (!Array.isArray(t.tags)) {
      errors.push({
        path: `${path}.tags`,
        message: 'tags must be an array',
        value: t.tags,
      });
    } else {
      t.tags.forEach((tag, tagIndex) => {
        if (typeof tag !== 'string') {
          errors.push({
            path: `${path}.tags[${tagIndex}]`,
            message: 'tag must be a string',
            value: tag,
          });
        }
      });
    }
  }

  return errors;
}

/**
 * Check for circular dependencies
 */
function checkCircularDependencies(tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  function hasCycle(taskId: string, visited: Set<string>, path: string[]): boolean {
    if (visited.has(taskId)) {
      return true;
    }

    const task = taskMap.get(taskId);
    if (!task || !task.dependencies) {
      return false;
    }

    visited.add(taskId);
    path.push(taskId);

    for (const depId of task.dependencies) {
      if (hasCycle(depId, visited, path)) {
        return true;
      }
    }

    visited.delete(taskId);
    path.pop();
    return false;
  }

  for (const task of tasks) {
    const path: string[] = [];
    if (hasCycle(task.id, new Set(), path)) {
      errors.push({
        path: `tasks`,
        message: `Circular dependency detected involving ${task.id}`,
        value: path,
      });
    }
  }

  return errors;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }

  return errors
    .map((e) => `  • ${e.path}: ${e.message}${e.value !== undefined ? ` (got: ${JSON.stringify(e.value)})` : ''}`)
    .join('\n');
}
