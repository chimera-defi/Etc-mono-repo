import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';

// Task status enum
export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'running',
  'pr_open',
  'completed',
  'failed',
  'cancelled',
]);

// PR state enum
export const prStateEnum = pgEnum('pr_state', [
  'open',
  'merged',
  'closed',
]);

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  task: text('task').notNull(),
  repoUrl: text('repo_url'),
  repoPath: text('repo_path'),
  status: taskStatusEnum('status').notNull().default('pending'),
  output: text('output'),
  error: text('error'),
  // PR lifecycle fields
  prUrl: text('pr_url'),
  prNumber: integer('pr_number'),
  prBranch: text('pr_branch'),
  prState: prStateEnum('pr_state'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export type TaskRecord = typeof tasks.$inferSelect;
export type NewTaskRecord = typeof tasks.$inferInsert;
