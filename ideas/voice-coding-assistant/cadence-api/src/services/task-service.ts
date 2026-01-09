import { eq } from 'drizzle-orm';
import { Task } from '../types.js';
import { db, schema, useMockStorage } from '../db/index.js';

// In-memory storage for mock mode
const mockTasks = new Map<string, Task>();

/**
 * Task service for database operations
 * Provides a clean interface for task CRUD operations
 * Supports mock storage for tests
 */
export class TaskService {
  /**
   * Convert database record to Task type
   */
  private toTask(record: typeof schema.tasks.$inferSelect): Task {
    return {
      id: record.id,
      task: record.task,
      repoUrl: record.repoUrl ?? undefined,
      repoPath: record.repoPath ?? undefined,
      status: record.status,
      output: record.output ?? undefined,
      createdAt: record.createdAt.toISOString(),
      completedAt: record.completedAt?.toISOString(),
    };
  }

  /**
   * Create a new task
   */
  async create(taskData: {
    task: string;
    repoUrl?: string;
    repoPath?: string;
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    output?: string;
  }): Promise<Task> {
    if (useMockStorage) {
      const task: Task = {
        id: crypto.randomUUID(),
        task: taskData.task,
        repoUrl: taskData.repoUrl,
        repoPath: taskData.repoPath,
        status: taskData.status ?? 'pending',
        output: taskData.output,
        createdAt: new Date().toISOString(),
      };
      mockTasks.set(task.id, task);
      return task;
    }

    const [record] = await db!
      .insert(schema.tasks)
      .values({
        task: taskData.task,
        repoUrl: taskData.repoUrl ?? null,
        repoPath: taskData.repoPath ?? null,
        status: taskData.status ?? 'pending',
        output: taskData.output ?? null,
      })
      .returning();

    return this.toTask(record);
  }

  /**
   * Get task by ID
   */
  async get(id: string): Promise<Task | null> {
    if (useMockStorage) {
      return mockTasks.get(id) ?? null;
    }

    const records = await db!
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .limit(1);

    return records.length > 0 ? this.toTask(records[0]) : null;
  }

  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    if (useMockStorage) {
      return Array.from(mockTasks.values());
    }

    const records = await db!
      .select()
      .from(schema.tasks)
      .orderBy(schema.tasks.createdAt);

    return records.map(r => this.toTask(r));
  }

  /**
   * Update task
   */
  async update(
    id: string,
    updates: {
      status?: 'pending' | 'running' | 'pr_open' | 'completed' | 'failed' | 'cancelled';
      output?: string;
      error?: string;
      completedAt?: Date;
      prUrl?: string;
      prNumber?: number;
      prBranch?: string;
      prState?: 'open' | 'merged' | 'closed';
    }
  ): Promise<Task | null> {
    if (useMockStorage) {
      const task = mockTasks.get(id);
      if (!task) return null;
      if (updates.status) task.status = updates.status;
      if (updates.output) task.output = updates.output;
      if (updates.completedAt) task.completedAt = updates.completedAt.toISOString();
      if (updates.completedAt === undefined && 'completedAt' in updates) task.completedAt = undefined;
      if (updates.prUrl) task.prUrl = updates.prUrl;
      if (updates.prNumber) task.prNumber = updates.prNumber;
      if (updates.prBranch) task.prBranch = updates.prBranch;
      if (updates.prState) task.prState = updates.prState;
      return task;
    }

    const [record] = await db!
      .update(schema.tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    return record ? this.toTask(record) : null;
  }

  /**
   * Delete all tasks (for testing)
   */
  async clear(): Promise<void> {
    if (useMockStorage) {
      mockTasks.clear();
      return;
    }
    await db!.delete(schema.tasks);
  }

  /**
   * Find task by output containing text (e.g., PR URL)
   */
  async findByOutput(text: string): Promise<Task | null> {
    if (useMockStorage) {
      for (const task of mockTasks.values()) {
        if (task.output?.includes(text)) {
          return task;
        }
      }
      return null;
    }

    const records = await db!
      .select()
      .from(schema.tasks);

    const found = records.find(r => r.output?.includes(text));
    return found ? this.toTask(found) : null;
  }

  /**
   * Find task by PR URL
   */
  async findByPrUrl(prUrl: string): Promise<Task | null> {
    if (useMockStorage) {
      for (const task of mockTasks.values()) {
        if (task.prUrl === prUrl) {
          return task;
        }
      }
      return null;
    }

    const records = await db!
      .select()
      .from(schema.tasks);

    const found = records.find(r => (r as unknown as Task).prUrl === prUrl);
    return found ? this.toTask(found) : null;
  }

  /**
   * Find a running task for a given repository URL (without a PR yet)
   * Used to link newly opened PRs to their originating task
   */
  async findRunningTaskForRepo(repoUrl: string): Promise<Task | null> {
    if (useMockStorage) {
      for (const task of mockTasks.values()) {
        if (task.status === 'running' && task.repoUrl === repoUrl && !task.prUrl) {
          return task;
        }
      }
      return null;
    }

    const records = await db!
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.repoUrl, repoUrl));

    const found = records.find(r =>
      r.status === 'running' && !(r as unknown as Task).prUrl
    );
    return found ? this.toTask(found) : null;
  }
}

// Export singleton instance
export const taskService = new TaskService();
